<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentCurriculumAndEnrollmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_it_and_is_curricula_have_same_amount_with_cs(): void
    {
        $bscs = Course::where('course_code', 'BSCS')->first();
        $bsit = Course::where('course_code', 'BSIT')->first();
        $bsis = Course::where('course_code', 'BSIS')->first();

        $csCount = $bscs->subjects()->count();
        $itCount = $bsit->subjects()->count();
        $isCount = $bsis->subjects()->count();

        $this->assertGreaterThan(40, $csCount);
        $this->assertSame($csCount, $itCount, 'BSIT subject count must match BSCS subject count');
        $this->assertSame($csCount, $isCount, 'BSIS subject count must match BSCS subject count');
    }

    public function test_regular_upperclassman_passes_previous_courses(): void
    {
        // Maria Santos is BSCS 3rd Year
        $maria = Student::where('student_number', '2026-00124')->first();
        $this->assertNotNull($maria);
        $this->assertSame(3, $maria->year_level);

        // Maria must have passed all Year 1 and Year 2 subjects of BSCS
        $priorBscsSubjects = $maria->course->subjects()->where('year_level', '<', 3)->get();
        $this->assertNotEmpty($priorBscsSubjects);

        foreach ($priorBscsSubjects as $subject) {
            $enrollment = $maria->enrollments()->where('subject_id', $subject->id)->first();
            $this->assertNotNull($enrollment, "Enrollment missing for prior subject {$subject->subject_code}");
            $this->assertSame('Passed', $enrollment->remarks);
            $this->assertNotNull($enrollment->grade);
            $this->assertLessThanOrEqual(3.00, (float) $enrollment->grade);
        }

        // Juan Dela Cruz is BSIT 2nd Year
        $juan = Student::where('student_number', '2026-00123')->first();
        $this->assertNotNull($juan);
        $this->assertSame(2, $juan->year_level);

        $priorBsitSubjects = $juan->course->subjects()->where('year_level', '<', 2)->get();
        $this->assertNotEmpty($priorBsitSubjects);

        foreach ($priorBsitSubjects as $subject) {
            $enrollment = $juan->enrollments()->where('subject_id', $subject->id)->first();
            $this->assertNotNull($enrollment, "Enrollment missing for prior subject {$subject->subject_code}");
            $this->assertSame('Passed', $enrollment->remarks);
        }
    }

    public function test_admin_can_create_student_with_automatic_student_number(): void
    {
        $admin = User::where('email', 'admin@cuyotech.edu.ph')->first();
        $bsit = Course::where('course_code', 'BSIT')->first();

        $response = $this->actingAs($admin)->postJson('/api/admin/users', [
            'name' => 'Auto Student Admin Test',
            'email' => 'autostudent_admin@cuyotech.edu.ph',
            'role' => 'student',
            'student_number' => 'auto',
            'course_id' => $bsit->id,
            'year_level' => 3,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('student.year_level', 3);

        $newStudent = Student::where('user_id', $response->json('user.id'))->first();
        $this->assertNotNull($newStudent);
        $this->assertMatchesRegularExpression('/^\d{4}-\d{5}$/', $newStudent->student_number);

        // Being 3rd year, previous Year 1 and Year 2 subjects must be automatically passed
        $passedCount = $newStudent->enrollments()->where('remarks', 'Passed')->count();
        $this->assertGreaterThan(0, $passedCount);
    }

    public function test_department_module_can_admit_student_with_automatic_student_number(): void
    {
        $deptUser = User::where('email', 'department@cuyotech.edu.ph')->first();
        $bsis = Course::where('course_code', 'BSIS')->first();

        $response = $this->actingAs($deptUser)->postJson('/api/department/students', [
            'name' => 'Department Enrolled Student',
            'email' => 'deptstudent@cuyotech.edu.ph',
            'course_id' => $bsis->id,
            'year_level' => 2,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('student.year_level', 2);

        $newStudent = Student::find($response->json('student.id'));
        $this->assertNotNull($newStudent);
        $this->assertMatchesRegularExpression('/^\d{4}-\d{5}$/', $newStudent->student_number);

        // Year 2 student has Year 1 subjects automatically passed
        $passedCount = $newStudent->enrollments()->where('remarks', 'Passed')->count();
        $this->assertGreaterThan(0, $passedCount);
    }
}
