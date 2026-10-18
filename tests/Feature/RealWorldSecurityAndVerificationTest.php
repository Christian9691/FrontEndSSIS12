<?php

namespace Tests\Feature;

use App\Models\ClearanceRecord;
use App\Models\DocumentRequest;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class RealWorldSecurityAndVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        RateLimiter::clear('login:127.0.0.1');
    }

    public function test_public_verification_endpoint_validates_released_document_with_masked_pii(): void
    {
        $releasedDoc = DocumentRequest::where('processing_status', 'released')->first();
        $this->assertNotNull($releasedDoc, 'A released document should exist from DatabaseSeeder');
        $this->assertNotNull($releasedDoc->verification_token, 'Released document must have a verification token');

        // Unauthenticated public request
        $response = $this->getJson("/api/v1/verify/{$releasedDoc->verification_token}");

        $response->assertStatus(200)
            ->assertJsonPath('valid', true)
            ->assertJsonPath('document_type', $releasedDoc->document_type)
            ->assertJsonPath('tracking_number', $releasedDoc->tracking_number)
            ->assertJsonStructure([
                'valid',
                'tracking_number',
                'document_type',
                'student_name_masked',
                'degree_program',
                'college',
                'release_date',
                'status',
                'signature',
            ]);

        // Student real name must be masked in compliance with RA 10173 (Data Privacy Act)
        $studentRealName = $releasedDoc->student->user->name;
        $maskedName = $response->json('student_name_masked');
        $this->assertNotEquals($studentRealName, $maskedName);
        $this->assertStringContainsString('***', $maskedName);
    }

    public function test_public_verification_returns_404_for_invalid_token(): void
    {
        $response = $this->getJson('/api/v1/verify/NON-EXISTENT-CRYPTOGRAPHIC-TOKEN-999');

        $response->assertStatus(404)
            ->assertJsonPath('valid', false)
            ->assertJsonPath('message', 'No certified document found matching this verification token.');
    }

    public function test_student_cannot_view_another_students_document_request_idor_protection(): void
    {
        $studentUser1 = User::where('email', 'student@cuyotech.edu.ph')->first();
        $studentUser2 = User::where('email', 'pedro@cuyotech.edu.ph')->first();

        // Doc request belonging to student 1
        $doc = DocumentRequest::where('student_id', $studentUser1->student->id)->first();
        $this->assertNotNull($doc);

        // Student 2 attempts to query Student 1's request via tracking number
        $response = $this->actingAs($studentUser2)->getJson("/api/document-requests/{$doc->tracking_number}");

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Unauthorized access. You may only view your own document requests.');
    }

    public function test_staff_roles_can_view_any_document_request(): void
    {
        $registrarUser = User::where('role', 'registrar')->first();
        $doc = DocumentRequest::first();

        $response = $this->actingAs($registrarUser)->getJson("/api/document-requests/{$doc->tracking_number}");

        $response->assertStatus(200)
            ->assertJsonPath('request.tracking_number', $doc->tracking_number);
    }

    public function test_non_cashier_cannot_issue_official_receipt(): void
    {
        $studentUser = User::where('role', 'student')->first();
        $doc = DocumentRequest::where('processing_status', 'pending_payment')->first();

        $response = $this->actingAs($studentUser)->postJson('/api/payments/issue-receipt', [
            'document_request_id' => $doc->id,
            'payment_method' => 'cash',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Unauthorized. Only Cashier officers or Administrators can issue Official Receipts.');
    }

    public function test_released_document_automatically_generates_cryptographic_seal_upon_update_status(): void
    {
        $registrar = User::where('role', 'registrar')->first();
        $doc = DocumentRequest::where('processing_status', '!=', 'released')->first();
        $this->assertNull($doc->verification_token);

        $response = $this->actingAs($registrar)->patchJson("/api/document-requests/{$doc->id}/status", [
            'status' => 'released',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $freshDoc = $doc->fresh();
        $this->assertEquals('released', $freshDoc->processing_status);
        $this->assertNotNull($freshDoc->verification_token);
        $this->assertNotNull($freshDoc->signature);
        $this->assertNotNull($freshDoc->release_date);
    }

    public function test_auth_login_rate_limiting_triggers_after_repeated_failures(): void
    {
        RateLimiter::clear('login:127.0.0.1');

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', [
                'identifier' => 'unknown_student_account@cuyotech.edu.ph',
                'password' => 'WrongPassword123!',
            ]);
        }

        // 6th attempt should trigger 429 Too Many Requests
        $throttleResponse = $this->postJson('/api/auth/login', [
            'identifier' => 'unknown_student_account@cuyotech.edu.ph',
            'password' => 'WrongPassword123!',
        ]);

        $throttleResponse->assertStatus(429)
            ->assertJsonPath('success', false);
    }

    public function test_student_can_submit_clearance_appeal(): void
    {
        $pedroUser = User::where('email', 'pedro@cuyotech.edu.ph')->first();
        $holdRecord = ClearanceRecord::where('student_id', $pedroUser->student->id)->where('status', 'hold')->first();

        $response = $this->actingAs($pedroUser)->postJson('/api/student/clearance/appeal', [
            'clearance_record_id' => $holdRecord->id,
            'appeal_notes' => 'Returned the borrowed book to Library Counter on Oct 18 with receipt slip #LIB-9912.',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('record.appeal_status', 'pending');

        $this->assertDatabaseHas('clearance_records', [
            'id' => $holdRecord->id,
            'appeal_status' => 'pending',
        ]);
    }

    public function test_user_can_fetch_and_read_notifications(): void
    {
        $studentUser = User::where('email', 'student@cuyotech.edu.ph')->first();

        $response = $this->actingAs($studentUser)->getJson('/api/notifications');
        $response->assertStatus(200)
            ->assertJsonStructure(['notifications', 'unread_count']);

        $this->assertGreaterThan(0, $response->json('unread_count'));

        $firstNotifId = $response->json('notifications.0.id');
        $readResponse = $this->actingAs($studentUser)->patchJson("/api/notifications/{$firstNotifId}/read");
        $readResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        $readAllResponse = $this->actingAs($studentUser)->postJson('/api/notifications/read-all');
        $readAllResponse->assertStatus(200);

        $afterResponse = $this->actingAs($studentUser)->getJson('/api/notifications');
        $this->assertEquals(0, $afterResponse->json('unread_count'));
    }

    public function test_cashier_can_export_coa_daily_summary_csv(): void
    {
        $cashierUser = User::where('role', 'cashier')->first();

        $response = $this->actingAs($cashierUser)->get('/api/payments/export-coa');

        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('attachment', $response->headers->get('Content-Disposition'));
    }
}
