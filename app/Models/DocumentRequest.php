<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class DocumentRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'tracking_number',
        'student_id',
        'assigned_admin_id',
        'document_type',
        'purpose',
        'processing_status',
        'assessment_fee',
        'requested_date',
        'release_date',
    ];

    protected function casts(): array
    {
        return [
            'assessment_fee' => 'decimal:2',
            'requested_date' => 'datetime',
            'release_date' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function assignedAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_admin_id');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * Standard university assessment fee calculator
     */
    public static function calculateAssessmentFee(string $type, int $copies = 1): float
    {
        $baseFee = match ($type) {
            'TOR' => 150.00,
            'COR' => 75.00,
            'Certification' => 50.00,
            default => 50.00,
        };

        return round($baseFee * max(1, $copies), 2);
    }

    /**
     * Generate unique tracking number: e.g. TRK-2026-XXXXX
     */
    public static function generateTrackingNumber(): string
    {
        do {
            $code = 'TRK-'.date('Y').'-'.strtoupper(substr(uniqid(), -5));
        } while (self::where('tracking_number', $code)->exists());

        return $code;
    }
}
