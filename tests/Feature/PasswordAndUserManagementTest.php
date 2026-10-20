<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordAndUserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_user_can_login_with_valid_password(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'student@cuyotech.edu.ph',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.email', 'student@cuyotech.edu.ph');
    }

    public function test_user_cannot_login_with_incorrect_password(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'identifier' => 'student@cuyotech.edu.ph',
            'password' => 'WrongPassword999!',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Incorrect password.');
    }

    public function test_user_can_change_own_password(): void
    {
        $studentUser = User::where('email', 'student@cuyotech.edu.ph')->first();

        $response = $this->actingAs($studentUser)->postJson('/api/auth/change-password', [
            'current_password' => 'password',
            'new_password' => 'MyNewSecurePass2026!',
            'new_password_confirmation' => 'MyNewSecurePass2026!',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        // Verify password hash updated in database
        $studentUser->refresh();
        $this->assertTrue(Hash::check('MyNewSecurePass2026!', $studentUser->password));
        $this->assertFalse(Hash::check('password', $studentUser->password));

        // Test login with old password fails
        $failLogin = $this->postJson('/api/auth/login', [
            'identifier' => 'student@cuyotech.edu.ph',
            'password' => 'password',
        ]);
        $failLogin->assertStatus(401);

        // Test login with new password succeeds
        $successLogin = $this->postJson('/api/auth/login', [
            'identifier' => 'student@cuyotech.edu.ph',
            'password' => 'MyNewSecurePass2026!',
        ]);
        $successLogin->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_change_password_validates_current_password_and_confirmation(): void
    {
        $studentUser = User::where('email', 'student@cuyotech.edu.ph')->first();

        // Wrong current password
        $responseWrongCurrent = $this->actingAs($studentUser)->postJson('/api/auth/change-password', [
            'current_password' => 'incorrectCurrentPass',
            'new_password' => 'ValidNewPass123!',
            'new_password_confirmation' => 'ValidNewPass123!',
        ]);
        $responseWrongCurrent->assertStatus(422)
            ->assertJsonPath('success', false);

        // Mismatched confirmation
        $responseMismatch = $this->actingAs($studentUser)->postJson('/api/auth/change-password', [
            'current_password' => 'password',
            'new_password' => 'ValidNewPass123!',
            'new_password_confirmation' => 'DifferentPass456!',
        ]);
        $responseMismatch->assertStatus(422);
    }

    public function test_admin_can_update_user_information_but_cannot_change_passwords(): void
    {
        $admin = User::where('email', 'admin@cuyotech.edu.ph')->first();
        $studentUser = User::where('email', 'student@cuyotech.edu.ph')->first();
        $bscs = Course::where('course_code', 'BSCS')->first();

        $originalPasswordHash = $studentUser->password;

        $response = $this->actingAs($admin)->putJson("/api/admin/users/{$studentUser->id}", [
            'name' => 'Juan Dela Cruz Updated',
            'email' => 'juan.updated@cuyotech.edu.ph',
            'role' => 'student',
            'status' => 'active',
            'course_id' => $bscs->id,
            'year_level' => 3,
            'password' => 'HackerOrAdminInjectedPassword!', // Even if attempted, should NOT alter user password
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('user.name', 'Juan Dela Cruz Updated')
            ->assertJsonPath('user.email', 'juan.updated@cuyotech.edu.ph');

        $studentUser->refresh();
        $this->assertSame('Juan Dela Cruz Updated', $studentUser->name);
        $this->assertSame('juan.updated@cuyotech.edu.ph', $studentUser->email);
        $this->assertSame($bscs->id, $studentUser->student->course_id);
        $this->assertSame(3, $studentUser->student->year_level);

        // Password MUST remain unchanged
        $this->assertSame($originalPasswordHash, $studentUser->password);
        $this->assertTrue(Hash::check('password', $studentUser->password));
        $this->assertFalse(Hash::check('HackerOrAdminInjectedPassword!', $studentUser->password));
    }

    public function test_non_admin_cannot_update_user_records(): void
    {
        $studentUser = User::where('email', 'student@cuyotech.edu.ph')->first();
        $otherUser = User::where('email', 'maria@cuyotech.edu.ph')->first();

        $response = $this->actingAs($studentUser)->putJson("/api/admin/users/{$otherUser->id}", [
            'name' => 'Unauthorized Change Attempt',
            'email' => 'maria@cuyotech.edu.ph',
            'role' => 'student',
        ]);

        // Blocked by role:admin middleware
        $response->assertStatus(403);
    }
}
