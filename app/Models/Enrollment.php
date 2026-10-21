<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'subject_id',
        'academic_year',
        'semester',
        'grade',
        'remarks',
        'enrollment_status',
    ];

    protected function casts(): array
    {
        return [
            'grade' => 'decimal:2',
        ];
    }

    /**
     * Standard remarks for a numeric grade (1.00 best, 3.00 lowest pass, 4.00 conditional, 5.00 failed).
     */
    public static function remarksForGrade(float $grade): string
    {
        return match (true) {
            $grade <= config('ssis.passing_grade') => 'Passed',
            $grade < 5.00 => 'Conditional',
            default => 'Failed',
        };
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}
