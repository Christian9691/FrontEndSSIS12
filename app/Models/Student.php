<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'student_number',
        'year_level',
        'clearance_status',
    ];

    protected function casts(): array
    {
        return [
            'clearance_status' => 'boolean',
            'year_level' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function documentRequests(): HasMany
    {
        return $this->hasMany(DocumentRequest::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function clearanceRecords(): HasMany
    {
        return $this->hasMany(ClearanceRecord::class);
    }

    /**
     * Units-weighted average of all graded, non-dropped enrollments (null if none graded yet).
     */
    public function calculateGwa(): ?float
    {
        $graded = $this->enrollments()->with('subject')
            ->whereNotNull('grade')->where('enrollment_status', '!=', 'dropped')->get();

        $units = $graded->sum(fn ($e) => $e->subject->units ?? 3);
        if ($units <= 0) {
            return null;
        }

        return round($graded->sum(fn ($e) => $e->grade * ($e->subject->units ?? 3)) / $units, 2);
    }

    /**
     * Dean's Lister: GWA of 1.75 or better with no grade worse than 2.50.
     */
    public function academicStanding(?float $gwa = null): string
    {
        $gwa ??= $this->calculateGwa();
        if ($gwa === null) {
            return 'No Grades Yet';
        }
        $worst = (float) $this->enrollments()->whereNotNull('grade')->max('grade');

        return ($gwa <= 1.75 && $worst <= 2.50) ? "Dean's Lister" : 'Regular Standing';
    }

    /**
     * Check if student is cleared across all departments.
     */
    public function isFullyCleared(): bool
    {
        $hasHold = $this->clearanceRecords()->where('status', 'hold')->exists();

        return $this->clearance_status && ! $hasHold;
    }

    /**
     * Automatically credits all subjects in prior year levels as passed with realistic passing grades.
     * Essential for Regular standing students in 2nd, 3rd, or 4th year.
     */
    public function seedPreviousYearsAsPassed(): int
    {
        if ($this->year_level <= 1) {
            return 0;
        }

        $priorSubjects = Subject::where('course_id', $this->course_id)
            ->where('year_level', '<', $this->year_level)
            ->orderBy('year_level')
            ->orderBy('semester')
            ->get();

        $currentAy = (int) substr(config('ssis.current_academic_year', '2026-2027'), 0, 4);
        $credited = 0;

        foreach ($priorSubjects as $subject) {
            $existing = $this->enrollments()->where('subject_id', $subject->id)->first();
            if ($existing) {
                if ($existing->grade === null || (float) $existing->grade > 3.00) {
                    $existing->update([
                        'grade' => 1.50,
                        'remarks' => 'Passed',
                        'enrollment_status' => 'enrolled',
                    ]);
                    $credited++;
                }

                continue;
            }

            // Derive appropriate academic year based on year level difference
            // e.g. for a 3rd year student in 2026-2027:
            // Year 2 was 2025-2026, Year 1 was 2024-2025
            $yearDiff = $this->year_level - $subject->year_level;
            $startYear = $currentAy - $yearDiff;
            $ayString = sprintf('%d-%d', $startYear, $startYear + 1);

            // Realistic passing grades (1.25, 1.50, 1.75, 2.00)
            $gradesPool = [1.25, 1.50, 1.75, 2.00, 1.50, 1.25, 1.75];
            $grade = $gradesPool[($subject->id + $this->id) % count($gradesPool)];

            Enrollment::create([
                'student_id' => $this->id,
                'subject_id' => $subject->id,
                'academic_year' => $ayString,
                'semester' => $subject->semester,
                'grade' => $grade,
                'remarks' => 'Passed',
                'enrollment_status' => 'enrolled',
            ]);
            $credited++;
        }

        return $credited;
    }

    /**
     * Generate next sequential student number, e.g. 2026-00127.
     */
    public static function generateNextStudentNumber(): string
    {
        $year = (string) date('Y');

        $latest = static::where('student_number', 'like', "{$year}-%")
            ->orderBy('student_number', 'desc')
            ->first();

        if ($latest && preg_match('/^(\d{4})-(\d+)$/', $latest->student_number, $matches)) {
            $nextSeq = (int) $matches[2] + 1;
        } else {
            $highest = static::whereNotNull('student_number')->orderBy('student_number', 'desc')->first();
            if ($highest && preg_match('/^\d{4}-(\d+)$/', $highest->student_number, $matches)) {
                $nextSeq = (int) $matches[2] + 1;
            } else {
                $nextSeq = 127;
            }
        }

        return sprintf('%s-%05d', $year, $nextSeq);
    }
}
