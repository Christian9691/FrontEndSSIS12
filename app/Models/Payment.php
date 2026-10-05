<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_request_id',
        'processed_by_user_id',
        'official_receipt_no',
        'amount_paid',
        'payment_method',
        'payment_status',
        'transaction_date',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'transaction_date' => 'datetime',
        ];
    }

    public function documentRequest(): BelongsTo
    {
        return $this->belongsTo(DocumentRequest::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by_user_id');
    }

    public static function generateReceiptNumber(): string
    {
        do {
            $num = 'OR-'.date('Y').'-'.str_pad((string) mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
        } while (self::where('official_receipt_no', $num)->exists());

        return $num;
    }
}
