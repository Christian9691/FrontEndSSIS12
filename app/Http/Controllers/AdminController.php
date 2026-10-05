<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Course;
use App\Models\DocumentRequest;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $totalUsers = User::count();
        $totalStudents = Student::count();
        $totalRequests = DocumentRequest::count();
        $pendingPayments = DocumentRequest::where('processing_status', 'pending_payment')->count();
        $totalCollections = Payment::where('payment_status', 'verified')->sum('amount_paid');
        $clearedStudents = Student::where('clearance_status', true)->count();

        $recentLogs = AuditLog::with('user')
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get()
            ->map(fn ($l) => [
                'id' => $l->id,
                'user_name' => $l->user->name ?? 'System',
                'action' => $l->action,
                'details' => $l->details,
                'ip_address' => $l->ip_address,
                'created_at' => $l->created_at->format('M d, Y h:i A'),
            ]);

        return response()->json([
            'metrics' => [
                'total_users' => $totalUsers,
                'total_students' => $totalStudents,
                'total_requests' => $totalRequests,
                'pending_payments' => $pendingPayments,
                'total_collections' => (float) $totalCollections,
                'clearance_rate' => $totalStudents > 0 ? round(($clearedStudents / $totalStudents) * 100, 1) : 100,
            ],
            'audit_logs' => $recentLogs,
        ]);
    }

    public function getUsers(): JsonResponse
    {
        $users = User::with(['student.course'])->orderBy('id', 'asc')->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'status' => $u->status,
                'student_number' => $u->student->student_number ?? null,
                'course' => $u->student->course->course_code ?? null,
                'created_at' => $u->created_at->format('Y-m-d'),
            ];
        });

        $courses = Course::all();

        return response()->json([
            'users' => $users,
            'courses' => $courses,
        ]);
    }

    public function createUser(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:student,registrar,cashier,admin,department',
            'password' => 'nullable|string|min:6',
            'student_number' => 'nullable|string|max:30|unique:students,student_number',
            'course_id' => 'nullable|exists:courses,id',
            'year_level' => 'nullable|integer|min:1|max:5',
        ]);

        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password', 'password')),
            'role' => $request->input('role'),
            'status' => 'active',
        ]);

        if ($user->role === 'student') {
            $studentNumber = $request->input('student_number') ?: '2026-'.str_pad((string) mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
            $courseId = $request->input('course_id') ?: Course::first()?->id ?? 1;

            Student::create([
                'user_id' => $user->id,
                'course_id' => $courseId,
                'student_number' => $studentNumber,
                'year_level' => $request->input('year_level', 1),
                'clearance_status' => true,
            ]);
        }

        AuditLog::record(
            Auth::id() ?? 1,
            'User Account Created',
            "Created {$user->role} account for {$user->name} ({$user->email})"
        );

        return response()->json([
            'success' => true,
            'message' => "User account for {$user->name} created successfully.",
            'user' => $user,
        ], 201);
    }

    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $newStatus = $request->input('status');

        if (! in_array($newStatus, ['active', 'inactive', 'suspended'])) {
            $newStatus = $user->status === 'active' ? 'inactive' : 'active';
        }

        $user->status = $newStatus;
        $user->save();

        AuditLog::record(
            Auth::id() ?? 1,
            'User Status Changed',
            "Changed status of {$user->name} to {$newStatus}"
        );

        return response()->json([
            'success' => true,
            'message' => "Account {$user->name} is now {$newStatus}.",
            'status' => $user->status,
        ]);
    }
}
