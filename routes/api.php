<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AiController;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FileUploadController;
use App\Http\Controllers\HealthMetricController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| MediFlow API Routes  (prefix: /api/v1)
|--------------------------------------------------------------------------
*/

// ── Authentication (Public) ──────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('register',         [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('login',            [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('forgot-password',  [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
    Route::post('reset-password',   [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');

    // Protected
    Route::middleware('jwt.auth')->group(function () {
        Route::post('logout',   [AuthController::class, 'logout']);
        Route::post('refresh',  [AuthController::class, 'refresh']);
        Route::get('me',        [AuthController::class, 'me']);
        Route::put('profile',   [AuthController::class, 'updateProfile']);
        Route::put('password',  [AuthController::class, 'updatePassword']);
    });
});

// ── Protected Routes ─────────────────────────────────────────────────────────
Route::middleware('jwt.auth')->group(function () {

    // ── Admin ────────────────────────────────────────────────────────────────
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('dashboard',      [AdminController::class, 'dashboard']);
        Route::get('users',          [AdminController::class, 'users']);
        Route::put('users/{id}',     [AdminController::class, 'updateUser']);
        Route::delete('users/{id}',  [AdminController::class, 'deleteUser']);
        Route::get('activity-logs',  [AdminController::class, 'activityLogs']);
        Route::get('analytics',      [AdminController::class, 'analytics']);
        Route::get('doctors',        [AdminController::class, 'getDoctors']);
        Route::post('assign-doctor', [AdminController::class, 'assignDoctor']);
        Route::post('unassign-doctor', [AdminController::class, 'unassignDoctor']);
        Route::post('create-doctor', [AdminController::class, 'createDoctor']);
        Route::get('pending-doctors', [AdminController::class, 'getPendingDoctors']);
        Route::post('verify-doctor', [AdminController::class, 'verifyDoctor']);
    });

    // ── Patients ─────────────────────────────────────────────────────────────
    Route::prefix('patients')->group(function () {
        Route::get('/',           [PatientController::class, 'index'])->middleware('role:admin,doctor');
        Route::post('/',          [PatientController::class, 'store'])->middleware('role:admin,doctor');
        Route::post('/request-doctor', [PatientController::class, 'requestDoctor'])->middleware('role:patient');
        Route::get('{id}',        [PatientController::class, 'show']);
        Route::put('{id}',        [PatientController::class, 'update'])->middleware('role:admin,doctor');
        Route::delete('{id}',     [PatientController::class, 'destroy'])->middleware('role:admin');
        Route::post('{id}/assign-doctor', [PatientController::class, 'assignDoctor'])->middleware('role:admin');

        // Health Metrics (nested)
        Route::prefix('{patientId}/metrics')->group(function () {
            Route::get('/',         [HealthMetricController::class, 'index']);
            Route::post('/',        [HealthMetricController::class, 'store'])->middleware('role:admin,doctor');
            Route::get('recent',    [HealthMetricController::class, 'recent']);
            Route::get('latest',    [HealthMetricController::class, 'latest']);
            Route::get('averages',  [HealthMetricController::class, 'averages']);
        });
    });

    // ── Doctors (Public list of verified doctors) ─────────────────────────────
    Route::get('doctors', [AdminController::class, 'getDoctors']);

    // ── Alerts ───────────────────────────────────────────────────────────────
    Route::prefix('alerts')->group(function () {
        Route::get('/',             [AlertController::class, 'index']);
        Route::get('stats',         [AlertController::class, 'stats']);
        Route::get('{id}',          [AlertController::class, 'show']);
        Route::patch('{id}/status', [AlertController::class, 'updateStatus'])->middleware('role:admin,doctor');
    });

    // ── Reports ──────────────────────────────────────────────────────────────
    Route::prefix('reports')->group(function () {
        Route::get('/',               [ReportController::class, 'index']);
        Route::post('generate',       [ReportController::class, 'generate'])->middleware('role:admin,doctor', 'throttle:15,1');
        Route::get('{id}',            [ReportController::class, 'show']);
        Route::get('{id}/pdf',        [ReportController::class, 'downloadPdf'])->middleware('throttle:20,1');
        Route::patch('{id}/notes',    [ReportController::class, 'addNotes'])->middleware('role:admin,doctor');
    });

    // ── Notifications ─────────────────────────────────────────────────────────
    Route::prefix('notifications')->group(function () {
        Route::get('/',                   [NotificationController::class, 'index']);
        Route::patch('{id}/read',         [NotificationController::class, 'markRead']);
        Route::post('mark-all-read',      [NotificationController::class, 'markAllRead']);
        Route::delete('{id}',             [NotificationController::class, 'destroy']);
    });

    // ── Appointments ──────────────────────────────────────────────────────────
    Route::prefix('appointments')->group(function () {
        Route::get('/',       [AppointmentController::class, 'index']);
        Route::post('/',      [AppointmentController::class, 'store'])->middleware('role:admin,doctor');
        Route::patch('{id}',  [AppointmentController::class, 'update']);
        Route::delete('{id}', [AppointmentController::class, 'destroy'])->middleware('role:admin,doctor');
    });

    // ── AI Features ───────────────────────────────────────────────────────────
    Route::prefix('ai')->group(function () {
        Route::post('risk/{patientId}',          [AiController::class, 'analyseRisk'])->middleware('throttle:30,1');
        Route::get('risk/{patientId}/history',   [AiController::class, 'riskHistory']);
        Route::post('report-summary/{patientId}',[AiController::class, 'reportSummary'])->middleware('role:admin,doctor', 'throttle:20,1');
        Route::post('chat',                      [AiController::class, 'chat'])->middleware('throttle:30,1');
        Route::get('chat/history',               [AiController::class, 'chatHistory']);
        Route::delete('chat/history',            [AiController::class, 'clearChat']);
    });

    // ── File Uploads ──────────────────────────────────────────────────────────
    Route::prefix('uploads')->group(function () {
        Route::post('/',              [FileUploadController::class, 'store']);
        Route::get('/{patientId}',    [FileUploadController::class, 'index']);
        Route::get('/serve/{id}',     [FileUploadController::class, 'serve']);
        Route::delete('/{id}',        [FileUploadController::class, 'destroy']);
    });

    // ── WebSocket Auth (Reverb) ───────────────────────────────────────────────
    Route::post('broadcasting/auth', function () {
        return response()->json(['message' => 'Authorized']);
    });
});
