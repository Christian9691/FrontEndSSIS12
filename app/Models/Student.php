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
}
