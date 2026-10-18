<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\ClearanceRecord;
use App\Models\DocumentRequest;
use App\Models\Notification;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DocumentRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $query = DocumentRequest::with(['student.user', 'student.course', 'assignedAdmin', 'payment.processedBy'])
            ->orderBy('requested_date', 'desc');

        if ($user && $user->role === 'student' && $user->student) {
            $query->where('student_id', $user->student->id);
        } elseif ($request->has('student_id')) {
            $query->where('student_id', $request->query('student_id'));
        }

        $requests = $query->get()->map(function ($req) {
            return $this->formatRequestData($req);
        });

        return response()->json([
            'requests' => $requests,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'document_type' => 'required|in:TOR,COR,Certification',
            'purpose' => 'required|string|max:255',
            'copies' => 'nullable|integer|min:1|max:10',
        ]);

        $user = Auth::user();
        $student = null;
        if ($user && $user->role === 'student') {
            $student = $user->student;
        }

        if (! $student && $request->filled('student_id')) {
            $student = Student::find($request->input('student_id'));
        }

        if (! $student) {
            $student = Student::first();
        }

        // --- SWIMLANE ACTIVITY DIAGRAM STEP: Verify Academic Clearance & Eligibility ---
        $holds = ClearanceRecord::where('student_id', $student->id)
            ->where('status', 'hold')
            ->get();

        if (! $student->clearance_status || $holds->isNotEmpty()) {
            $holdDetails = $holds->map(fn ($h) => "{$h->signatory_name}: {$h->hold_reason}")->join('; ');

            return response()->json([
                'success' => false,
                'has_hold' => true,
                'message' => 'Request blocked by Clearance Hold. You must clear all departmental obligations before requesting official school documents.',
                'holds' => $holds,
                'hold_summary' => $holdDetails ?: 'Account uncleared by Department / Accounting.',
            ], 422);
        }

        $copies = (int) ($request->input('copies', 1));
        $fee = DocumentRequest::calculateAssessmentFee($request->input('document_type'), $copies);
        $trackingNumber = DocumentRequest::generateTrackingNumber();

        $docRequest = DocumentRequest::create([
            'tracking_number' => $trackingNumber,
            'student_id' => $student->id,
            'assigned_admin_id' => null,
            'document_type' => $request->input('document_type'),
            'purpose' => $request->input('purpose').($copies > 1 ? " ({$copies} copies)" : ''),
            'processing_status' => 'pending_payment',
            'assessment_fee' => $fee,
            'requested_date' => now(),
            'release_date' => null,
        ]);

        AuditLog::record(
            $user?->id ?? $student->user_id,
            'Document Request Submitted',
            "Submitted {$docRequest->document_type} request with tracking #{$trackingNumber}. Assessment fee: ₱{$fee}"
        );

        // Notify Cashier
        $cashier = User::where('role', 'cashier')->first();
        if ($cashier) {
            Notification::send(
                $cashier->id,
                'New Assessment Fee Pending',
                "New {$docRequest->document_type} request (#{$trackingNumber}) by {$student->user->name} pending fee settlement of ₱{$fee}.",
                'payment',
                '/cashier'
            );
        }

        $docRequest->load(['student.user', 'student.course']);

        return response()->json([
            'success' => true,
            'message' => 'Document request successfully submitted! Please settle the assessment fee to proceed with processing.',
            'request' => $this->formatRequestData($docRequest),
        ], 201);
    }

    public function show(string $trackingNumber): JsonResponse
    {
        $user = Auth::user();
        $req = DocumentRequest::with(['student.user', 'student.course.department', 'assignedAdmin', 'payment.processedBy'])
            ->where('tracking_number', $trackingNumber)
            ->orWhere('id', $trackingNumber)
            ->firstOrFail();

        // Object-level authorization check (IDOR Prevention)
        if ($user && $user->role === 'student' && $user->student && $req->student_id !== $user->student->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. You may only view your own document requests.',
            ], 403);
        }

        return response()->json([
            'request' => $this->formatRequestData($req),
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $user = Auth::user();
        if ($user && ! in_array($user->role, ['registrar', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only the Registrar or Administrator can update request processing status.',
            ], 403);
        }

        $request->validate([
            'status' => 'required|in:pending_payment,paid,processing,ready_for_pickup,released,rejected',
            'assigned_admin_id' => 'nullable|exists:users,id',
        ]);

        $docRequest = DocumentRequest::with('student.user')->findOrFail($id);
        $newStatus = $request->input('status');

        $docRequest->processing_status = $newStatus;

        if ($request->filled('assigned_admin_id')) {
            $docRequest->assigned_admin_id = $request->input('assigned_admin_id');
        } elseif (Auth::check()) {
            $docRequest->assigned_admin_id = Auth::id();
        }

        if ($newStatus === 'released') {
            $docRequest->release_date = now();
            $docRequest->issueVerificationSeal();
        } else {
            $docRequest->save();
        }

        // Notify student of status update
        if ($docRequest->student?->user_id) {
            $statusText = match ($newStatus) {
                'ready_for_pickup' => 'Your document is printed and ready for pickup at Window 4.',
                'released' => 'Your official document has been cryptographically certified and released.',
                'processing' => 'Your request is currently being verified and printed by the Registrar.',
                'rejected' => 'Your request could not be processed. Please check with the Registrar office.',
                default => "Request status updated to {$newStatus}."
            };
            Notification::send(
                $docRequest->student->user_id,
                'Document Status: '.ucfirst(str_replace('_', ' ', $newStatus)),
                "Tracking #{$docRequest->tracking_number} ({$docRequest->document_type}): {$statusText}",
                'document',
                '/student/requests'
            );
        }

        AuditLog::record(
            Auth::id() ?? 2,
            'Document Request Status Updated',
            "Updated tracking #{$docRequest->tracking_number} status to '{$newStatus}'"
        );

        $docRequest->load(['student.user', 'student.course', 'assignedAdmin', 'payment.processedBy']);

        return response()->json([
            'success' => true,
            'message' => "Request #{$docRequest->tracking_number} status updated to {$newStatus}.",
            'request' => $this->formatRequestData($docRequest),
        ]);
    }

    protected function formatRequestData(DocumentRequest $req): array
    {
        $student = $req->student;
        $payment = $req->payment;

        return [
            'id' => $req->id,
            'tracking_number' => $req->tracking_number,
            'student_id' => $req->student_id,
            'student_name' => $student->user->name ?? 'Student',
            'student_number' => $student->student_number ?? '',
            'course' => $student->course->course_code ?? '',
            'course_title' => $student->course->course_title ?? '',
            'document_type' => $req->document_type,
            'purpose' => $req->purpose,
            'processing_status' => $req->processing_status,
            'assessment_fee' => (float) $req->assessment_fee,
            'requested_date' => $req->requested_date?->format('Y-m-d H:i'),
            'release_date' => $req->release_date?->format('Y-m-d H:i'),
            'assigned_admin' => $req->assignedAdmin?->name,
            'verification_token' => $req->verification_token,
            'signature' => $req->signature,
            'verification_url' => url('/verify/'.($req->verification_token ?: $req->tracking_number)),
            'payment' => $payment ? [
                'id' => $payment->id,
                'official_receipt_no' => $payment->official_receipt_no,
                'amount_paid' => (float) $payment->amount_paid,
                'payment_method' => $payment->payment_method,
                'payment_status' => $payment->payment_status,
                'transaction_date' => $payment->transaction_date?->format('Y-m-d H:i'),
                'cashier_name' => $payment->processedBy?->name ?? 'Cashier Office',
            ] : null,
        ];
    }
}
