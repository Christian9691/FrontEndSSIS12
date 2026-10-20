<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\Subject;
use App\Services\CurriculumService;
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

    public function approveEnrollment(Request $request, int $studentId, CurriculumService $curriculum): JsonResponse
    {
        $student = Student::with('user')->findOrFail($studentId);

        $approved = Enrollment::where('student_id', $student->id)
            ->where('enrollment_status', 'pending')
            ->update(['enrollment_status' => 'enrolled', 'remarks' => 'Enrolled']);

        if ($approved === 0) {
            return response()->json([
                'success' => false,
                'message' => "No pending enrollments to approve for {$student->student_number}.",
            ], 422);
        }

        AuditLog::record(
            Auth::id() ?? 2,
            'Enrollment Approved',
            "Approved {$approved} pending subject(s) for student {$student->student_number}"
        );
        $curriculum->notifyStudent($student, 'Enrollment Approved', "The Registrar approved {$approved} subject(s) for your enrollment.", 'success');

        return response()->json([
            'success' => true,
            'message' => "Enrollment officially approved for student {$student->student_number}.",
        ]);
    }

    /**
     * Registrar enrolls a student directly (status = enrolled).
     */
    public function enrollStudent(Request $request, int $studentId, CurriculumService $curriculum): JsonResponse
    {
        $student = Student::with(['user', 'course'])->findOrFail($studentId);

        $data = $request->validate([
            'subject_ids' => 'required|array|min:1',
            'subject_ids.*' => 'integer',
            'academic_year' => ['nullable', 'string', 'regex:/^\d{4}-\d{4}$/'],
            'semester' => 'nullable|in:1st Semester,2nd Semester,Summer',
        ]);

        $result = $curriculum->enroll($student, $data['subject_ids'], $data['academic_year'] ?? null, $data['semester'] ?? null, 'enrolled');

        if ($result['error']) {
            return response()->json(['success' => false, 'message' => $result['error']], 422);
        }
        if (empty($result['enrolled'])) {
            return response()->json(['success' => false, 'message' => 'No subjects could be enrolled.', 'skipped' => $result['skipped']], 422);
        }

        $count = count($result['enrolled']);
        AuditLog::record(Auth::id() ?? 2, 'Student Enrolled', "Enrolled {$student->student_number} in {$count} subject(s)");
        $curriculum->notifyStudent($student, 'Subjects Added', "The Registrar enrolled you in {$count} subject(s).", 'success');

        return response()->json([
            'success' => true,
            'message' => "Enrolled {$student->user->name} in {$count} subject(s).",
            'skipped' => $result['skipped'],
        ], 201);
    }

    /**
     * Drop an ungraded enrollment.
     */
    public function dropEnrollment(int $enrollmentId, CurriculumService $curriculum): JsonResponse
    {
        $enrollment = Enrollment::with(['student.user', 'subject'])->findOrFail($enrollmentId);

        if ($enrollment->grade !== null) {
            return response()->json(['success' => false, 'message' => 'A graded subject cannot be dropped.'], 422);
        }
        if ($enrollment->enrollment_status === 'dropped') {
            return response()->json(['success' => false, 'message' => 'Subject is already dropped.'], 422);
        }

        $enrollment->update(['enrollment_status' => 'dropped', 'remarks' => 'Dropped']);

        AuditLog::record(Auth::id() ?? 2, 'Subject Dropped', "Dropped {$enrollment->subject->subject_code} for {$enrollment->student->student_number}");
        $curriculum->notifyStudent($enrollment->student, 'Subject Dropped', "{$enrollment->subject->subject_code} was dropped from your enrollment.", 'warning');

        return response()->json(['success' => true, 'message' => "{$enrollment->subject->subject_code} dropped."]);
    }

    public function getGradesSheet(Request $request): JsonResponse
    {
        $subjectsCollection = Subject::with(['course'])->orderBy('subject_code')->get();
        $selectedSubjectId = $request->query('subject_id', $subjectsCollection->first()?->id);

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

        $subjects = $subjectsCollection->map(function ($s) {
            return [
                'id' => $s->id,
                'course_id' => $s->course_id,
                'course_code' => $s->course->course_code ?? 'GEN',
                'course_title' => $s->course->course_title ?? 'General',
                'subject_code' => $s->subject_code,
                'subject_title' => $s->subject_title,
                'units' => $s->units,
                'semester' => $s->semester,
                'year_level' => $s->year_level,
            ];
        });

        $programs = Course::orderBy('course_code')->get(['id', 'course_code', 'course_title']);

        return response()->json([
            'subjects' => $subjects,
            'programs' => $programs,
            'selected_subject_id' => (int) $selectedSubjectId,
            'grades' => $enrollments,
        ]);
    }

    public function saveGrade(Request $request, CurriculumService $curriculum): JsonResponse
    {
        $request->validate([
            'enrollment_id' => 'required|exists:enrollments,id',
            'grade' => 'required|numeric|min:1.00|max:5.00',
        ]);

        $enrollment = Enrollment::with(['student.user', 'subject'])->findOrFail($request->input('enrollment_id'));

        if ($enrollment->enrollment_status !== 'enrolled') {
            return response()->json([
                'success' => false,
                'message' => 'Grades can only be encoded for officially enrolled subjects (this one is '.$enrollment->enrollment_status.').',
            ], 422);
        }

        $grade = round((float) $request->input('grade'), 2);
        $remarks = Enrollment::remarksForGrade($grade);

        $enrollment->grade = $grade;
        $enrollment->remarks = $remarks;
        $enrollment->save();

        AuditLog::record(
            Auth::id() ?? 2,
            'Grade Encoded',
            "Encoded grade {$grade} ({$remarks}) for student {$enrollment->student->student_number} in {$enrollment->subject->subject_code}"
        );
        $curriculum->notifyStudent($enrollment->student, 'New Grade Posted', "{$enrollment->subject->subject_code}: {$grade} ({$remarks}).", $remarks === 'Passed' ? 'success' : 'warning');

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
