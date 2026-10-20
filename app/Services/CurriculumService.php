<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\Notification;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Support\Collection;

class CurriculumService
{
    private const SEMESTER_ORDER = ['1st Semester' => 1, '2nd Semester' => 2, 'Summer' => 3];

    /**
     * Build the student's program curriculum organised by year level and semester,
     * with the student's standing (passed, in progress, pending, ...) for every subject.
     */
    public function build(Student $student): array
    {
        $student->loadMissing(['user', 'course.department']);

        $subjects = Subject::where('course_id', $student->course_id)
            ->orderBy('year_level')->orderBy('subject_code')->get();

        // Group every enrollment attempt by subject; latest attempt decides current status.
        $attempts = Enrollment::where('student_id', $student->id)
            ->orderBy('id')->get()->groupBy('subject_id');

        $years = $subjects->groupBy('year_level')->sortKeys()->map(function (Collection $yearSubjects, $year) use ($attempts, $student) {
            $semesters = $yearSubjects->groupBy('semester')
                ->sortBy(fn ($_, $sem) => self::SEMESTER_ORDER[$sem] ?? 9)
                ->map(function (Collection $termSubjects, $semester) use ($attempts) {
                    $rows = $termSubjects->map(fn (Subject $s) => $this->subjectRow($s, $attempts->get($s->id)))->values();

                    return [
                        'semester' => $semester,
                        'total_units' => $rows->sum('units'),
                        'passed_units' => $rows->where('status', 'passed')->sum('units'),
                        'subjects' => $rows,
                    ];
                })->values();

            return [
                'year_level' => (int) $year,
                'label' => $this->yearLabel((int) $year),
                'is_current' => (int) $year === (int) $student->year_level,
                'total_units' => $semesters->sum('total_units'),
                'passed_units' => $semesters->sum('passed_units'),
                'semesters' => $semesters,
            ];
        })->values();

        $all = $years->flatMap(fn ($y) => $y['semesters'])->flatMap(fn ($t) => $t['subjects']);
        $totalUnits = $all->sum('units');
        $passedUnits = $all->where('status', 'passed')->sum('units');

        return [
            'student' => [
                'id' => $student->id,
                'name' => $student->user->name ?? '',
                'student_number' => $student->student_number,
                'course_code' => $student->course->course_code ?? '',
                'course_title' => $student->course->course_title ?? '',
                'year_level' => $student->year_level,
            ],
            'summary' => [
                'total_subjects' => $all->count(),
                'passed_subjects' => $all->where('status', 'passed')->count(),
                'total_units' => $totalUnits,
                'passed_units' => $passedUnits,
                'in_progress_units' => $all->whereIn('status', ['in progress', 'pending'])->sum('units'),
                'remaining_units' => max(0, $totalUnits - $passedUnits),
                'percent_complete' => $totalUnits > 0 ? round(($passedUnits / $totalUnits) * 100, 1) : 0,
            ],
            'years' => $years,
        ];
    }

    /**
     * Enroll (or request enrollment) in subjects for a term, with validation.
     * Returns ['enrolled' => [...], 'skipped' => [['subject_code'=>..., 'reason'=>...]], 'error' => ?string]
     */
    public function enroll(Student $student, array $subjectIds, ?string $academicYear, ?string $semester, string $status): array
    {
        $academicYear ??= config('ssis.current_academic_year');
        $semester ??= config('ssis.current_semester');

        if (! $student->isFullyCleared()) {
            return ['enrolled' => [], 'skipped' => [], 'error' => 'Student has an unresolved clearance hold and cannot enroll.'];
        }

        $subjects = Subject::where('course_id', $student->course_id)->whereIn('id', $subjectIds)->get()->keyBy('id');
        $attempts = Enrollment::where('student_id', $student->id)->get()->groupBy('subject_id');

        $termUnits = Enrollment::with('subject')
            ->where('student_id', $student->id)
            ->where('academic_year', $academicYear)->where('semester', $semester)
            ->whereIn('enrollment_status', ['pending', 'enrolled'])->get()
            ->sum(fn ($e) => $e->subject->units ?? 0);

        $enrolled = [];
        $skipped = [];

        foreach ($subjectIds as $id) {
            $subject = $subjects->get($id);
            if (! $subject) {
                $skipped[] = ['subject_id' => $id, 'subject_code' => null, 'reason' => 'Subject is not part of the student\'s program curriculum.'];

                continue;
            }

            $current = $this->latestAttempt($attempts->get($subject->id));
            $reason = match (true) {
                $current && $current->grade !== null && (float) $current->grade <= config('ssis.passing_grade') => 'Already passed.',
                $current && in_array($current->enrollment_status, ['pending', 'enrolled'], true) && $current->grade === null => 'Already enrolled or awaiting approval.',
                ($termUnits + $subject->units) > config('ssis.max_units_per_term') => 'Would exceed the '.config('ssis.max_units_per_term').'-unit term limit.',
                default => null,
            };

            if ($reason) {
                $skipped[] = ['subject_id' => $subject->id, 'subject_code' => $subject->subject_code, 'reason' => $reason];

                continue;
            }

            $termUnits += $subject->units;
            $enrolled[] = Enrollment::create([
                'student_id' => $student->id,
                'subject_id' => $subject->id,
                'academic_year' => $academicYear,
                'semester' => $semester,
                'remarks' => $status === 'pending' ? 'Pending Approval' : 'Enrolled',
                'enrollment_status' => $status,
            ]);
        }

        return ['enrolled' => $enrolled, 'skipped' => $skipped, 'error' => null];
    }

    public function notifyStudent(Student $student, string $title, string $message, string $type = 'info'): void
    {
        if ($student->user_id) {
            Notification::send($student->user_id, $title, $message, $type, '/student/grades');
        }
    }

    private function subjectRow(Subject $subject, ?Collection $attempts): array
    {
        $latest = $this->latestAttempt($attempts);
        $status = 'not taken';
        $grade = null;

        if ($latest) {
            $grade = $latest->grade !== null ? (float) $latest->grade : null;
            $status = match (true) {
                $grade !== null && $grade <= config('ssis.passing_grade') => 'passed',
                $grade !== null && $grade < 5.00 => 'conditional',
                $grade !== null => 'failed',
                $latest->enrollment_status === 'pending' => 'pending',
                $latest->enrollment_status === 'enrolled' => 'in progress',
                default => 'not taken', // dropped
            };
        }

        return [
            'id' => $subject->id,
            'subject_code' => $subject->subject_code,
            'subject_title' => $subject->subject_title,
            'units' => $subject->units,
            'status' => $status,
            'grade' => $grade,
            'academic_year' => $latest?->academic_year,
            'attempts' => $attempts?->count() ?? 0,
        ];
    }

    private function latestAttempt(?Collection $attempts): ?Enrollment
    {
        return $attempts?->sortByDesc('id')->first();
    }

    private function yearLabel(int $year): string
    {
        return match ($year) {
            1 => '1st Year', 2 => '2nd Year', 3 => '3rd Year',
            default => $year.'th Year',
        };
    }
}
