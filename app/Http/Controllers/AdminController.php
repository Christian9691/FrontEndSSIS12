<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\ClearanceRecord;
use App\Models\Course;
use App\Models\Department;
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
    public function dashboard(Request $request): JsonResponse
    {
        $totalUsers = User::count();
        $totalStudents = Student::count();
        $totalRequests = DocumentRequest::count();
        $pendingPayments = DocumentRequest::where('processing_status', 'pending_payment')->count();
        $totalCollections = Payment::where('payment_status', 'verified')->sum('amount_paid');
        $clearedStudents = Student::where('clearance_status', true)->count();

        $limit = $request->query('limit', 50);
        $sort = strtolower($request->query('sort', 'desc')) === 'asc' ? 'asc' : 'desc';
        $date = $request->query('date');

        $query = AuditLog::with('user');

        if ($date) {
            $query->whereDate('created_at', $date);
        }

        $query->orderBy('created_at', $sort);

        if ($limit !== 'all' && (int) $limit > 0) {
            $query->take((int) $limit);
        }

        $recentLogs = $query->get()->map(fn ($l) => [
            'id' => $l->id,
            'user_name' => $l->user->name ?? 'System',
            'action' => $l->action,
            'details' => $l->details,
            'ip_address' => $l->ip_address,
            'created_at' => $l->created_at->format('M d, Y h:i A'),
            'raw_date' => $l->created_at->toDateString(),
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

    public function getAuditLogs(Request $request): JsonResponse
    {
        $limit = $request->query('limit', 50);
        $sort = strtolower($request->query('sort', 'desc')) === 'asc' ? 'asc' : 'desc';
        $date = $request->query('date');
        $datePreset = $request->query('date_preset');
        $search = $request->query('search');

        $query = AuditLog::with('user');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                    ->orWhere('details', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($date) {
            $query->whereDate('created_at', $date);
        } elseif ($datePreset) {
            match ($datePreset) {
                'today' => $query->whereDate('created_at', now()->today()),
                'yesterday' => $query->whereDate('created_at', now()->yesterday()),
                'this_week' => $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]),
                'this_month' => $query->whereMonth('created_at', now()->month)->whereYear('created_at', now()->year),
                default => null,
            };
        }

        $totalCount = (clone $query)->count();

        $query->orderBy('created_at', $sort);

        if ($limit !== 'all' && (int) $limit > 0) {
            $query->take((int) $limit);
        }

        $logs = $query->get()->map(fn ($l) => [
            'id' => $l->id,
            'user_name' => $l->user->name ?? 'System',
            'action' => $l->action,
            'details' => $l->details,
            'ip_address' => $l->ip_address,
            'created_at' => $l->created_at->format('M d, Y h:i A'),
            'raw_date' => $l->created_at->toDateString(),
        ]);

        return response()->json([
            'audit_logs' => $logs,
            'total_count' => $totalCount,
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
                'course_id' => $u->student->course_id ?? null,
                'year_level' => $u->student->year_level ?? null,
                'created_at' => $u->created_at->format('Y-m-d'),
            ];
        });

        $courses = Course::all();

        return response()->json([
            'users' => $users,
            'courses' => $courses,
            'next_student_number' => Student::generateNextStudentNumber(),
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

        if ($request->input('role') === 'student') {
            $rawStudentNum = $request->input('student_number');
            $studentNumber = (! empty($rawStudentNum) && $rawStudentNum !== 'auto')
                ? $rawStudentNum
                : Student::generateNextStudentNumber();
            $initialPassword = $request->input('password') ?: $studentNumber;
        } else {
            $initialPassword = $request->input('password') ?: 'CuyoTech2026!';
        }

        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($initialPassword),
            'role' => $request->input('role'),
            'status' => 'active',
            'must_change_password' => true,
        ]);

        if ($user->role === 'student') {
            $courseId = $request->input('course_id') ?: Course::first()?->id ?? 1;
            $yearLevel = (int) $request->input('year_level', 1);

            $student = Student::create([
                'user_id' => $user->id,
                'course_id' => $courseId,
                'student_number' => $studentNumber,
                'year_level' => $yearLevel,
                'clearance_status' => true,
            ]);

            // For regular upperclassmen (Year 2, 3, 4), credit previous curriculum years as passed
            if ($yearLevel > 1) {
                $student->seedPreviousYearsAsPassed();
            }

            // Auto-initialize standard clearances so the student immediately appears in the Department Module
            $ccsDept = Department::where('department_code', 'CCS')->first() ?? Department::first();
            $libDept = Department::where('department_code', 'LIB')->first() ?? Department::skip(3)->first();
            if ($ccsDept) {
                ClearanceRecord::create([
                    'student_id' => $student->id,
                    'department_id' => $ccsDept->id,
                    'signatory_name' => $ccsDept->department_name.' Office',
                    'status' => 'cleared',
                    'cleared_at' => now(),
                ]);
            }
            if ($libDept) {
                ClearanceRecord::create([
                    'student_id' => $student->id,
                    'department_id' => $libDept->id,
                    'signatory_name' => 'University Library',
                    'status' => 'cleared',
                    'cleared_at' => now(),
                ]);
            }
        }

        AuditLog::record(
            Auth::id() ?? 1,
            'User Account Created',
            "Created {$user->role} account for {$user->name} ({$user->email})"
        );

        return response()->json([
            'success' => true,
            'message' => "User account for {$user->name} created successfully. Initial temporary password: {$initialPassword} (forced change on first sign-in).",
            'user' => $user->load('student.course'),
            'student' => $student ?? null,
            'initial_password' => $initialPassword,
            'next_student_number' => Student::generateNextStudentNumber(),
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

    /**
     * Admin update user institutional information (name, email, role, status, student course/year).
     * SECURITY POLICY: Administrator CANNOT modify user passwords. Passwords can only be changed by the account owner.
     */
    public function updateUser(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:150',
            'email' => "required|email|unique:users,email,{$id}",
            'role' => 'required|in:student,registrar,cashier,admin,department',
            'course_id' => 'nullable|exists:courses,id',
            'year_level' => 'nullable|integer|min:1|max:5',
            'status' => 'nullable|in:active,inactive,suspended',
        ]);

        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->role = $request->input('role');
        if ($request->filled('status')) {
            $user->status = $request->input('status');
        }
        $user->save();

        if ($user->role === 'student' && $user->student) {
            if ($request->filled('course_id')) {
                $user->student->course_id = (int) $request->input('course_id');
            }
            if ($request->filled('year_level')) {
                $user->student->year_level = (int) $request->input('year_level');
            }
            $user->student->save();
        }

        AuditLog::record(
            Auth::id() ?? 1,
            'User Information Updated',
            "Admin updated user information for {$user->name} (Role: {$user->role})"
        );

        return response()->json([
            'success' => true,
            'message' => "Institutional records for {$user->name} updated successfully.",
            'user' => $user->load('student.course'),
        ]);
    }
}
