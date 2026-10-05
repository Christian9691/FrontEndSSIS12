<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\DocumentRequestController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RegistrarController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;

// Authentication Endpoints
Route::prefix('api/auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Student Portal Endpoints
Route::prefix('api/student')->group(function () {
    Route::get('/dashboard', [StudentController::class, 'dashboard']);
    Route::get('/grades', [StudentController::class, 'grades']);
    Route::get('/subjects', [StudentController::class, 'subjects']);
    Route::get('/clearance', [StudentController::class, 'clearance']);
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
});

// Registrar Module Endpoints
Route::prefix('api/registrar')->group(function () {
    Route::get('/enrollments', [RegistrarController::class, 'getEnrollments']);
    Route::post('/enrollments/{studentId}/approve', [RegistrarController::class, 'approveEnrollment']);
    Route::get('/grades', [RegistrarController::class, 'getGradesSheet']);
    Route::post('/grades', [RegistrarController::class, 'saveGrade']);
});

// Department Module Endpoints
Route::prefix('api/department')->group(function () {
    Route::get('/clearances', [DepartmentController::class, 'index']);
    Route::patch('/clearances/{id}', [DepartmentController::class, 'updateClearance']);
    Route::post('/clearances/hold', [DepartmentController::class, 'addClearanceHold']);
});

// Admin Module Endpoints
Route::prefix('api/admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/users', [AdminController::class, 'getUsers']);
    Route::post('/users', [AdminController::class, 'createUser']);
    Route::patch('/users/{id}/status', [AdminController::class, 'toggleStatus']);
});

// Catch-all SPA Route: Serves the React Application
Route::get('/{any?}', fn () => view('app'))->where('any', '.*');
