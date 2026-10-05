<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RegistrarController extends Controller
{
    public function getEnrollments(): JsonResponse
    {
        $students = Student::with(['user', 'course.department', 'enrollments.subject'])
            ->get()
            ->map(function ($s) {
                $units = $s->enrollments->sum(fn ($e) => $e->subject->units ?? 3);
                $pendingCount = $s->enrollments->where('enrollment_status', 'pending')->count();

                return [
                    'id' => $s->id,
                    'student_number' => $s->student_number,
                    'name' => $s->user->name ?? 'Student',
                    'email' => $s->user->email ?? '',
                    'course' => $s->course->course_code ?? 'BSIT',
                    'course_title' => $s->course->course_title ?? '',
                    'year_level' => $s->year_level,
                    'clearance_status' => (bool) $s->clearance_status,
                    'total_subjects' => $s->enrollments->count(),
                    'total_units' => $units,
                    'enrollment_status' => $pendingCount > 0 ? 'Pending' : 'Enrolled',
                ];
            });

        $courses = Course::with('subjects')->get();

        return response()->json([
            'students' => $students,
            'courses' => $courses,
        ]);
    }

    public function approveEnrollment(Request $request, int $studentId): JsonResponse
    {
        $student = Student::findOrFail($studentId);

        Enrollment::where('student_id', $student->id)->update([
            'enrollment_status' => 'enrolled',
        ]);

        AuditLog::record(
            Auth::id() ?? 2,
            'Enrollment Approved',
            "Approved enrollment for student {$student->student_number}"
        );

        return response()->json([
            'success' => true,
            'message' => "Enrollment officially approved for student {$student->student_number}.",
        ]);
    }

    public function getGradesSheet(Request $request): JsonResponse
    {
        $subjects = Subject::with(['course'])->get();
        $selectedSubjectId = $request->query('subject_id', $subjects->first()?->id);

        $enrollments = Enrollment::with(['student.user', 'student.course', 'subject'])
            ->when($selectedSubjectId, fn ($q) => $q->where('subject_id', $selectedSubjectId))
            ->get()
            ->map(function ($e) {
                return [
                    'id' => $e->id,
                    'student_id' => $e->student_id,
                    'student_number' => $e->student->student_number ?? '',
                    'student_name' => $e->student->user->name ?? '',
                    'course' => $e->student->course->course_code ?? '',
                    'subject_id' => $e->subject_id,
                    'subject_code' => $e->subject->subject_code ?? '',
                    'subject_title' => $e->subject->subject_title ?? '',
                    'grade' => $e->grade !== null ? (float) $e->grade : null,
                    'remarks' => $e->remarks,
                    'status' => $e->enrollment_status,
                ];
            });

        return response()->json([
            'subjects' => $subjects,
            'selected_subject_id' => (int) $selectedSubjectId,
            'grades' => $enrollments,
        ]);
    }

    public function saveGrade(Request $request): JsonResponse
    {
        $request->validate([
            'enrollment_id' => 'required|exists:enrollments,id',
            'grade' => 'required|numeric|min:1.00|max:5.00',
        ]);

        $enrollment = Enrollment::with(['student.user', 'subject'])->findOrFail($request->input('enrollment_id'));
        $grade = round((float) $request->input('grade'), 2);

        $remarks = match (true) {
            $grade <= 3.00 => 'Passed',
            $grade == 4.00 => 'Conditional',
            $grade == 5.00 => 'Failed',
            default => 'Passed',
        };

        $enrollment->grade = $grade;
        $enrollment->remarks = $remarks;
        $enrollment->save();

        AuditLog::record(
            Auth::id() ?? 2,
            'Grade Encoded',
            "Encoded grade {$grade} ({$remarks}) for student {$enrollment->student->student_number} in {$enrollment->subject->subject_code}"
        );

        return response()->json([
            'success' => true,
            'message' => "Grade {$grade} ({$remarks}) saved successfully for {$enrollment->student->user->name}.",
            'enrollment' => [
                'id' => $enrollment->id,
                'grade' => $grade,
                'remarks' => $remarks,
            ],
        ]);
    }
}
