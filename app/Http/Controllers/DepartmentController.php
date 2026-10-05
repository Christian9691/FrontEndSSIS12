<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\ClearanceRecord;
use App\Models\Department;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DepartmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $departments = Department::withCount('courses')->get();

        $students = Student::with(['user', 'course.department', 'clearanceRecords.department'])
            ->get()
            ->map(function ($s) {
                $hasHold = $s->clearanceRecords->where('status', 'hold')->isNotEmpty();

                return [
                    'id' => $s->id,
                    'student_number' => $s->student_number,
                    'name' => $s->user->name ?? 'Student',
                    'email' => $s->user->email ?? '',
                    'course' => $s->course->course_code ?? 'BSIT',
                    'department' => $s->course->department->department_name ?? 'CCS',
                    'year_level' => $s->year_level,
                    'clearance_status' => ! $hasHold && (bool) $s->clearance_status,
                    'clearance_records' => $s->clearanceRecords->map(fn ($r) => [
                        'id' => $r->id,
                        'signatory' => $r->signatory_name,
                        'status' => $r->status,
                        'hold_reason' => $r->hold_reason,
                        'cleared_at' => $r->cleared_at?->format('Y-m-d H:i'),
                    ]),
                ];
            });

        return response()->json([
            'departments' => $departments,
            'students' => $students,
        ]);
    }

    public function updateClearance(Request $request, int $recordId): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:cleared,hold',
            'hold_reason' => 'nullable|string|max:255',
        ]);

        $record = ClearanceRecord::with('student')->findOrFail($recordId);
        $newStatus = $request->input('status');

        $record->status = $newStatus;
        $record->hold_reason = $newStatus === 'hold' ? $request->input('hold_reason', 'Account obligation pending') : null;
        $record->cleared_at = $newStatus === 'cleared' ? now() : null;
        $record->save();

        // Update parent student overall clearance status
        $student = $record->student;
        $activeHolds = ClearanceRecord::where('student_id', $student->id)->where('status', 'hold')->count();
        $student->clearance_status = ($activeHolds === 0);
        $student->save();

        AuditLog::record(
            Auth::id() ?? 4,
            'Clearance Status Updated',
            "Updated clearance record #{$record->id} for {$student->student_number} to '{$newStatus}'"
        );

        return response()->json([
            'success' => true,
            'message' => "Clearance status updated to {$newStatus}.",
            'record' => [
                'id' => $record->id,
                'status' => $record->status,
                'hold_reason' => $record->hold_reason,
                'cleared_at' => $record->cleared_at?->format('Y-m-d H:i'),
            ],
            'student_cleared' => (bool) $student->clearance_status,
        ]);
    }

    public function addClearanceHold(Request $request): JsonResponse
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'department_id' => 'nullable|exists:departments,id',
            'signatory_name' => 'required|string|max:100',
            'hold_reason' => 'required|string|max:255',
        ]);

        $student = Student::findOrFail($request->input('student_id'));

        $record = ClearanceRecord::create([
            'student_id' => $student->id,
            'department_id' => $request->input('department_id'),
            'signatory_name' => $request->input('signatory_name'),
            'status' => 'hold',
            'hold_reason' => $request->input('hold_reason'),
            'cleared_at' => null,
        ]);

        $student->clearance_status = false;
        $student->save();

        AuditLog::record(
            Auth::id() ?? 4,
            'Clearance Hold Added',
            "Placed clearance hold on student {$student->student_number}: {$record->hold_reason}"
        );

        return response()->json([
            'success' => true,
            'message' => 'Clearance hold placed successfully.',
            'record' => $record,
        ]);
    }
}
