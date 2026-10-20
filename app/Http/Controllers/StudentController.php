<?php

namespace App\Http\Controllers;

use App\Models\ClearanceRecord;
use App\Models\Enrollment;
use App\Models\Notification;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use App\Services\CurriculumService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentController extends Controller
{
    /**
     * Resolve currently active student
     */
    protected function resolveStudent(Request $request): ?Student
    {
        $user = Auth::user();
        if ($user && $user->role === 'student') {
            return $user->student;
        }

        // Staff (Registrar, Admin, Department) can inspect a specific student via student_id
        $studentId = $request->query('student_id');
        if ($studentId) {
            return Student::with(['user', 'course.department'])->find($studentId);
        }

        return Student::with(['user', 'course.department'])->first();
    }

    public function dashboard(Request $request): JsonResponse
    {
        $student = $this->resolveStudent($request);
        if (! $student) {
            return response()->json(['error' => 'Student record not found.'], 404);
        }

        $student->load(['user', 'course.department', 'enrollments.subject']);

        $enrollments = $student->enrollments->where('enrollment_status', '!=', 'dropped');
        $totalUnits = $enrollments->sum(fn ($e) => $e->subject->units ?? 3);
        $gwa = $student->calculateGwa();

        $clearanceHolds = ClearanceRecord::where('student_id', $student->id)
            ->where('status', 'hold')
            ->count();

        $recentRequests = $student->documentRequests()
            ->with('payment')
            ->orderBy('requested_date', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'student' => [
                'id' => $student->id,
                'name' => $student->user->name ?? 'Student',
                'student_number' => $student->student_number,
                'email' => $student->user->email ?? '',
                'course_code' => $student->course->course_code ?? 'BSIT',
                'course_title' => $student->course->course_title ?? 'BS Information Technology',
                'department_name' => $student->course->department->department_name ?? 'College of Computing Studies',
                'year_level' => $student->year_level,
                'clearance_status' => (bool) $student->clearance_status && $clearanceHolds === 0,
                'clearance_holds_count' => $clearanceHolds,
                'enrolled_subjects_count' => $enrollments->count(),
                'total_units' => $totalUnits,
                'gwa' => $gwa,
            ],
            'recent_requests' => $recentRequests,
        ]);
    }

    public function grades(Request $request): JsonResponse
    {
        $student = $this->resolveStudent($request);
        if (! $student) {
            return response()->json(['error' => 'Student record not found.'], 404);
        }

        $enrollments = Enrollment::with('subject')
            ->where('student_id', $student->id)
            ->orderBy('academic_year', 'desc')
            ->orderBy('semester', 'desc')
            ->get();

        $gwa = $student->calculateGwa();

        return response()->json([
            'student_name' => $student->user->name ?? '',
            'student_number' => $student->student_number,
            'course' => $student->course->course_title ?? '',
            'year_level' => $student->year_level,
            'gwa' => $gwa,
            'academic_standing' => $student->academicStanding($gwa),
            'grades' => $enrollments->map(fn ($e) => [
                'id' => $e->id,
                'subject_code' => $e->subject->subject_code ?? '',
                'subject_title' => $e->subject->subject_title ?? '',
                'units' => $e->subject->units ?? 3,
                'grade' => $e->grade !== null ? (float) $e->grade : null,
                'remarks' => $e->grade !== null ? Enrollment::remarksForGrade((float) $e->grade) : ($e->enrollment_status === 'dropped' ? 'Dropped' : ($e->enrollment_status === 'pending' ? 'Pending' : 'In Progress')),
                'academic_year' => $e->academic_year,
                'semester' => $e->semester,
            ]),
        ]);
    }

    public function subjects(Request $request): JsonResponse
    {
        $student = $this->resolveStudent($request);
        if (! $student) {
            return response()->json(['error' => 'Student record not found.'], 404);
        }

        $enrolled = Enrollment::with('subject')
            ->where('student_id', $student->id)
            ->get();

        $curriculum = Subject::where('course_id', $student->course_id)
            ->orderBy('year_level')
            ->orderBy('semester')
            ->get();

        return response()->json([
            'enrolled' => $enrolled->map(fn ($e) => [
                'id' => $e->id,
                'code' => $e->subject->subject_code ?? '',
                'title' => $e->subject->subject_title ?? '',
                'units' => $e->subject->units ?? 3,
                'semester' => $e->semester,
                'status' => $e->enrollment_status,
            ]),
            'curriculum' => $curriculum,
        ]);
    }

    /**
     * Program curriculum grouped by year level and semester, with per-subject status.
     */
    public function curriculum(Request $request, CurriculumService $curriculum): JsonResponse
    {
        $student = $this->resolveStudent($request);
        if (! $student) {
            return response()->json(['error' => 'Student record not found.'], 404);
        }

        return response()->json($curriculum->build($student));
    }

    /**
     * Student asks to enroll in subjects; creates 'pending' enrollments for registrar approval.
     */
    public function requestEnrollment(Request $request, CurriculumService $curriculum): JsonResponse
    {
        $student = $this->resolveStudent($request);
        if (! $student || Auth::user()?->role !== 'student') {
            return response()->json(['success' => false, 'message' => 'Only students can submit an enrollment request.'], 403);
        }

        $data = $request->validate([
            'subject_ids' => 'required|array|min:1',
            'subject_ids.*' => 'integer',
        ]);

        $result = $curriculum->enroll($student, $data['subject_ids'], null, null, 'pending');

        if ($result['error']) {
            return response()->json(['success' => false, 'message' => $result['error']], 422);
        }
        if (empty($result['enrolled'])) {
            return response()->json(['success' => false, 'message' => 'No subjects could be requested.', 'skipped' => $result['skipped']], 422);
        }

        $count = count($result['enrolled']);
        $registrar = User::where('role', 'registrar')->first();
        if ($registrar) {
            Notification::send($registrar->id, 'Enrollment Request', "{$student->user->name} ({$student->student_number}) requested {$count} subject(s).", 'info', '/registrar/enrollment');
        }

        return response()->json([
            'success' => true,
            'message' => "Enrollment request for {$count} subject(s) sent to the Registrar for approval.",
            'skipped' => $result['skipped'],
        ], 201);
    }

    public function clearance(Request $request): JsonResponse
    {
        $student = $this->resolveStudent($request);
        if (! $student) {
            return response()->json(['error' => 'Student record not found.'], 404);
        }

        $records = ClearanceRecord::with('department')
            ->where('student_id', $student->id)
            ->get();

        $hasHold = $records->where('status', 'hold')->isNotEmpty();

        return response()->json([
            'student_name' => $student->user->name ?? '',
            'student_number' => $student->student_number,
            'is_cleared' => ! $hasHold && (bool) $student->clearance_status,
            'records' => $records->map(fn ($r) => [
                'id' => $r->id,
                'department_code' => $r->department->department_code ?? 'DEPT',
                'signatory' => $r->signatory_name,
                'status' => $r->status, // 'cleared', 'hold'
                'hold_reason' => $r->hold_reason,
                'appeal_notes' => $r->appeal_notes,
                'appeal_status' => $r->appeal_status,
                'appeal_submitted_at' => $r->appeal_submitted_at?->format('M d, Y h:i A'),
                'cleared_at' => $r->cleared_at?->format('M d, Y h:i A'),
            ]),
        ]);
    }

    public function submitClearanceAppeal(Request $request): JsonResponse
    {
        $student = $this->resolveStudent($request);
        if (! $student) {
            return response()->json(['error' => 'Student record not found.'], 404);
        }

        $request->validate([
            'clearance_record_id' => 'required|exists:clearance_records,id',
            'appeal_notes' => 'required|string|max:1000',
        ]);

        $record = ClearanceRecord::where('id', $request->input('clearance_record_id'))
            ->where('student_id', $student->id)
            ->firstOrFail();

        $record->update([
            'appeal_notes' => $request->input('appeal_notes'),
            'appeal_status' => 'pending',
            'appeal_submitted_at' => now(),
        ]);

        // Dispatch in-app notification to department staff
        $deptStaff = User::where('role', 'department')->first();
        if ($deptStaff) {
            Notification::send(
                $deptStaff->id,
                'New Clearance Appeal Submitted',
                "Student {$student->user->name} ({$student->student_number}) submitted an appeal for {$record->signatory_name}.",
                'clearance',
                '/department'
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Your clearance appeal has been submitted for department officer review.',
            'record' => [
                'id' => $record->id,
                'appeal_notes' => $record->appeal_notes,
                'appeal_status' => $record->appeal_status,
                'appeal_submitted_at' => $record->appeal_submitted_at->format('M d, Y h:i A'),
            ],
        ]);
    }
}
