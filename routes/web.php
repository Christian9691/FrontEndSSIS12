<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DocumentRequestController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RegistrarController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\VerificationController;
use Illuminate\Support\Facades\Route;

// Authentication Endpoints
Route::prefix('api/auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
});

// Student Portal Endpoints
Route::prefix('api/student')->middleware('role:student,registrar,department')->group(function () {
    Route::get('/dashboard', [StudentController::class, 'dashboard']);
    Route::get('/grades', [StudentController::class, 'grades']);
    Route::get('/subjects', [StudentController::class, 'subjects']);
    Route::get('/curriculum', [StudentController::class, 'curriculum']);
    Route::post('/enrollment-request', [StudentController::class, 'requestEnrollment']);
    Route::get('/clearance', [StudentController::class, 'clearance']);
    Route::post('/clearance/appeal', [StudentController::class, 'submitClearanceAppeal']);
});

// Notifications Endpoints
Route::prefix('api/notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::patch('/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
});

// Document Request System (Shared: Student request & tracking + Staff processing)
Route::prefix('api/document-requests')->group(function () {
    Route::get('/', [DocumentRequestController::class, 'index']);
    Route::post('/', [DocumentRequestController::class, 'store']);
    Route::get('/{trackingNumber}', [DocumentRequestController::class, 'show']);
    Route::patch('/{id}/status', [DocumentRequestController::class, 'updateStatus']);
});

// Cashier Module Endpoints
Route::prefix('api/payments')->group(function () {
    Route::get('/', [PaymentController::class, 'index']);
    Route::post('/issue-receipt', [PaymentController::class, 'issueReceipt']);
    Route::get('/export-coa', [PaymentController::class, 'exportCoa']);
});

// Registrar Module Endpoints
Route::prefix('api/registrar')->middleware('role:registrar')->group(function () {
    Route::get('/enrollments', [RegistrarController::class, 'getEnrollments']);
    Route::post('/enrollments/{studentId}/approve', [RegistrarController::class, 'approveEnrollment']);
    Route::post('/students/{studentId}/enroll', [RegistrarController::class, 'enrollStudent']);
    Route::patch('/enrollments/{enrollmentId}/drop', [RegistrarController::class, 'dropEnrollment']);
    Route::get('/grades', [RegistrarController::class, 'getGradesSheet']);
    Route::post('/grades', [RegistrarController::class, 'saveGrade']);
});

// Department Module Endpoints
Route::prefix('api/department')->middleware('role:department')->group(function () {
    Route::get('/clearances', [DepartmentController::class, 'index']);
    Route::post('/students', [DepartmentController::class, 'createStudent']);
    Route::patch('/clearances/{id}', [DepartmentController::class, 'updateClearance']);
    Route::post('/clearances/hold', [DepartmentController::class, 'addClearanceHold']);
});

// Admin Module Endpoints
Route::prefix('api/admin')->middleware('role:admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/audit-logs', [AdminController::class, 'getAuditLogs']);
    Route::get('/users', [AdminController::class, 'getUsers']);
    Route::post('/users', [AdminController::class, 'createUser']);
    Route::put('/users/{id}', [AdminController::class, 'updateUser']);
    Route::patch('/users/{id}/status', [AdminController::class, 'toggleStatus']);
});

// Public Credential Verification Endpoints (Rate-limited, Privacy-Preserving)
Route::get('/api/v1/verify/{token}', [VerificationController::class, 'verify']);
Route::get('/api/verify/{token}', [VerificationController::class, 'verify']);

// Catch-all SPA Route: Serves the React Application
Route::get('/{any?}', fn () => view('app'))->where('any', '.*');
