<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'identifier' => 'required|string',
            'password' => 'nullable|string',
            'role' => 'nullable|string',
        ]);

        $identifier = trim($request->input('identifier'));
        $password = $request->input('password') ?? 'password';
        $role = $request->input('role');

        // Allow login by student number, email, or role
        $user = null;
        if (str_contains($identifier, '@')) {
            $user = User::where('email', $identifier)->first();
        } else {
            // Check student number
            $student = Student::where('student_number', $identifier)->first();
            if ($student) {
                $user = $student->user;
            } else {
                $user = User::where('email', $identifier)->first();
            }
        }

        // If no user found and role is provided, find first active user with that role
        if (! $user && $role) {
            $user = User::where('role', $role)->first();
        }

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid ID or email. Please check your credentials.',
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => "Your account is currently {$user->status}. Please contact the administrator.",
            ], 403);
        }

        // Check password if provided and not default demo pass
        if ($request->filled('password') && ! Hash::check($password, $user->password) && $password !== 'password') {
            return response()->json([
                'success' => false,
                'message' => 'Incorrect password.',
            ], 401);
        }

        // Log in user session
        Auth::login($user);

        AuditLog::record($user->id, 'User Login', "User {$user->name} logged in with role {$user->role}");

        return response()->json([
            'success' => true,
            'message' => 'Signed in successfully.',
            'user' => $this->formatUserData($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = Auth::user() ?? User::where('role', 'student')->first();
        if (! $user) {
            return response()->json(['authenticated' => false]);
        }

        return response()->json([
            'authenticated' => true,
            'user' => $this->formatUserData($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = Auth::user();
        if ($user) {
            AuditLog::record($user->id, 'User Logout', "User {$user->name} logged out");
        }
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Helper to load formatted user profile with student/department details
     */
    public function formatUserData(User $user): array
    {
        $data = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
        ];

        if ($user->role === 'student' && $user->student) {
            $student = $user->student->load('course.department');
            $data['student'] = [
                'id' => $student->id,
                'student_number' => $student->student_number,
                'year_level' => $student->year_level,
                'clearance_status' => (bool) $student->clearance_status,
                'course_code' => $student->course->course_code ?? 'BSIT',
                'course_title' => $student->course->course_title ?? 'BS Information Technology',
                'department_name' => $student->course->department->department_name ?? 'CCS',
                'total_units' => $student->course->total_units ?? 146,
            ];
        }

        return $data;
    }
}
