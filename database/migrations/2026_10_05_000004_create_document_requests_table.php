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
        Schema::create('document_requests', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_number', 50)->unique();
            $table->foreignId('student_id')->constrained('students')->onDelete('restrict');
            $table->foreignId('assigned_admin_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('document_type', 30); // 'TOR', 'COR', 'Certification'
            $table->string('purpose', 255);
            $table->string('processing_status', 30)->default('pending_payment'); // 'pending_payment', 'paid', 'processing', 'ready_for_pickup', 'released', 'rejected'
            $table->decimal('assessment_fee', 10, 2);
            $table->dateTime('requested_date');
            $table->dateTime('release_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_requests');
    }
};
