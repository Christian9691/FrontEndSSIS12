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
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->string('subject_code', 30);
            $table->string('subject_title', 150);
            $table->integer('units')->default(3);
            $table->string('semester', 30)->default('1st Semester');
            $table->integer('year_level')->default(1);
            $table->timestamps();
        });

        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->string('academic_year', 30)->default('2026-2027');
            $table->string('semester', 30)->default('1st Semester');
            $table->decimal('grade', 3, 2)->nullable();
            $table->string('remarks', 50)->default('Enrolled');
            $table->string('enrollment_status', 30)->default('enrolled'); // 'pending', 'enrolled', 'dropped'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollments');
        Schema::dropIfExists('subjects');
    }
};
