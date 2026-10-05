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
     * Check if student is cleared across all departments.
     */
    public function isFullyCleared(): bool
    {
        $hasHold = $this->clearanceRecords()->where('status', 'hold')->exists();

        return $this->clearance_status && ! $hasHold;
    }
}
