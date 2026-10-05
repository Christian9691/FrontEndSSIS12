<?php

namespace App\Http\Controllers;

use App\Models\ClearanceRecord;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\Subject;
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
        if ($user && $user->role === 'student' && $user->student) {
            return $user->student;
        }

        // Fallback for demo or studentId query param
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

        $enrollments = $student->enrollments;
        $totalUnits = $enrollments->sum(fn ($e) => $e->subject->units ?? 3);
        $gradedEnrollments = $enrollments->whereNotNull('grade');
        $gwa = null;
        if ($gradedEnrollments->isNotEmpty()) {
            $totalPoints = $gradedEnrollments->sum(fn ($e) => $e->grade * ($e->subject->units ?? 3));
            $gradedUnits = $gradedEnrollments->sum(fn ($e) => $e->subject->units ?? 3);
            $gwa = $gradedUnits > 0 ? round($totalPoints / $gradedUnits, 2) : null;
        }

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

        $graded = $enrollments->whereNotNull('grade');
        $gwa = null;
        if ($graded->isNotEmpty()) {
            $totalPoints = $graded->sum(fn ($e) => $e->grade * ($e->subject->units ?? 3));
            $gradedUnits = $graded->sum(fn ($e) => $e->subject->units ?? 3);
            $gwa = $gradedUnits > 0 ? round($totalPoints / $gradedUnits, 2) : null;
        }

        return response()->json([
            'student_name' => $student->user->name ?? '',
            'student_number' => $student->student_number,
            'course' => $student->course->course_title ?? '',
            'year_level' => $student->year_level,
            'gwa' => $gwa,
            'academic_standing' => $gwa && $gwa <= 1.75 ? "Dean's Lister / Regular" : 'Regular Standing',
            'grades' => $enrollments->map(fn ($e) => [
                'id' => $e->id,
                'subject_code' => $e->subject->subject_code ?? '',
                'subject_title' => $e->subject->subject_title ?? '',
                'units' => $e->subject->units ?? 3,
                'grade' => $e->grade !== null ? (float) $e->grade : null,
                'remarks' => $e->remarks ?? ($e->grade ? ($e->grade <= 3.0 ? 'Passed' : 'Failed') : 'In Progress'),
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
                'cleared_at' => $r->cleared_at?->format('M d, Y h:i A'),
            ]),
        ]);
    }
}
