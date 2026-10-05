<?php

namespace Tests\Feature;

use App\Models\ClearanceRecord;
use App\Models\DocumentRequest;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocumentRequestWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_student_can_fetch_dashboard_and_grades(): void
    {
        $studentUser = User::where('email', 'student@cuyotech.edu.ph')->first();

        $response = $this->actingAs($studentUser)->getJson('/api/student/dashboard');
        $response->assertStatus(200)
            ->assertJsonPath('student.student_number', '2026-00123')
            ->assertJsonPath('student.clearance_status', true);

        $gradesResponse = $this->actingAs($studentUser)->getJson('/api/student/grades');
        $gradesResponse->assertStatus(200)
            ->assertJsonStructure(['student_name', 'grades', 'gwa']);
    }

    public function test_clearance_hold_blocks_document_request_in_swimlane(): void
    {
        // Pedro Reyes has clearance holds in DatabaseSeeder
        $unclearedStudent = User::where('email', 'pedro@cuyotech.edu.ph')->first();

        $response = $this->actingAs($unclearedStudent)->postJson('/api/document-requests', [
            'document_type' => 'TOR',
            'purpose' => 'Transfer credentials',
            'copies' => 1,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('has_hold', true)
            ->assertJsonPath('success', false);
    }

    public function test_cleared_student_can_successfully_submit_document_request(): void
    {
        $clearedStudent = User::where('email', 'student@cuyotech.edu.ph')->first();

        $response = $this->actingAs($clearedStudent)->postJson('/api/document-requests', [
            'document_type' => 'TOR',
            'purpose' => 'Employment application',
            'copies' => 2,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('request.assessment_fee', 300) // 150 * 2 copies
            ->assertJsonPath('request.processing_status', 'pending_payment');

        $this->assertDatabaseHas('document_requests', [
            'purpose' => 'Employment application (2 copies)',
            'document_type' => 'TOR',
        ]);
    }

    public function test_cashier_can_issue_official_receipt_and_advance_status(): void
    {
        $cashier = User::where('role', 'cashier')->first();
        $docRequest = DocumentRequest::where('processing_status', 'pending_payment')->first();

        $response = $this->actingAs($cashier)->postJson('/api/payments/issue-receipt', [
            'document_request_id' => $docRequest->id,
            'payment_method' => 'online',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('request_status', 'processing');

        $this->assertDatabaseHas('payments', [
            'document_request_id' => $docRequest->id,
            'payment_method' => 'online',
            'payment_status' => 'verified',
        ]);

        $this->assertEquals('processing', $docRequest->fresh()->processing_status);
    }

    public function test_registrar_can_release_document(): void
    {
        $registrar = User::where('role', 'registrar')->first();
        $docRequest = DocumentRequest::first();

        $response = $this->actingAs($registrar)->patchJson("/api/document-requests/{$docRequest->id}/status", [
            'status' => 'released',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('request.processing_status', 'released');

        $this->assertNotNull($docRequest->fresh()->release_date);
    }

    public function test_department_can_clear_hold(): void
    {
        $student = Student::where('student_number', '2026-00125')->first();
        $record = ClearanceRecord::where('student_id', $student->id)->where('status', 'hold')->first();

        $deptUser = User::where('role', 'department')->first();

        $response = $this->actingAs($deptUser)->patchJson("/api/department/clearances/{$record->id}", [
            'status' => 'cleared',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('record.status', 'cleared');
    }
}
