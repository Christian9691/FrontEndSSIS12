<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_request_id')->unique()->constrained('document_requests')->onDelete('restrict');
            $table->foreignId('processed_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('official_receipt_no', 50)->unique();
            $table->decimal('amount_paid', 10, 2);
            $table->string('payment_method', 30); // 'cash', 'online', 'bank_transfer'
            $table->string('payment_status', 30)->default('verified'); // 'pending', 'verified', 'failed'
            $table->dateTime('transaction_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
