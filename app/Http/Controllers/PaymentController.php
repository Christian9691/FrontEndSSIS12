<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\DocumentRequest;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $payments = Payment::with(['documentRequest.student.user', 'processedBy'])
            ->orderBy('transaction_date', 'desc')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'official_receipt_no' => $p->official_receipt_no,
                    'document_request_id' => $p->document_request_id,
                    'tracking_number' => $p->documentRequest->tracking_number ?? 'N/A',
                    'document_type' => $p->documentRequest->document_type ?? 'N/A',
                    'student_name' => $p->documentRequest->student->user->name ?? 'N/A',
                    'student_number' => $p->documentRequest->student->student_number ?? 'N/A',
                    'amount_paid' => (float) $p->amount_paid,
                    'payment_method' => $p->payment_method,
                    'payment_status' => $p->payment_status,
                    'transaction_date' => $p->transaction_date?->format('Y-m-d H:i'),
                    'cashier_name' => $p->processedBy->name ?? 'Cashier Desk',
                ];
            });

        $totalCollections = $payments->where('payment_status', 'verified')->sum('amount_paid');

        // Also get pending assessment fees that need payment
        $pendingRequests = DocumentRequest::with(['student.user', 'student.course'])
            ->where('processing_status', 'pending_payment')
            ->whereDoesntHave('payment')
            ->get()
            ->map(function ($r) {
                return [
                    'id' => $r->id,
                    'tracking_number' => $r->tracking_number,
                    'student_name' => $r->student->user->name ?? 'N/A',
                    'student_number' => $r->student->student_number ?? 'N/A',
                    'document_type' => $r->document_type,
                    'purpose' => $r->purpose,
                    'assessment_fee' => (float) $r->assessment_fee,
                    'requested_date' => $r->requested_date?->format('Y-m-d H:i'),
                ];
            });

        return response()->json([
            'payments' => $payments,
            'total_collections' => $totalCollections,
            'pending_requests' => $pendingRequests,
        ]);
    }

    public function issueReceipt(Request $request): JsonResponse
    {
        $request->validate([
            'document_request_id' => 'required|exists:document_requests,id',
            'amount_paid' => 'nullable|numeric|min:1',
            'payment_method' => 'required|in:cash,online,bank_transfer',
            'official_receipt_no' => 'nullable|string|max:50',
        ]);

        $docRequest = DocumentRequest::with('payment')->findOrFail($request->input('document_request_id'));

        if ($docRequest->payment) {
            return response()->json([
                'success' => false,
                'message' => 'Official Receipt already issued for this request.',
            ], 422);
        }

        $receiptNo = $request->input('official_receipt_no') ?: Payment::generateReceiptNumber();
        $amount = $request->input('amount_paid') ?: $docRequest->assessment_fee;
        $cashierId = Auth::id() ?? 3; // Default to Cashier User if unauthenticated

        $payment = Payment::create([
            'document_request_id' => $docRequest->id,
            'processed_by_user_id' => $cashierId,
            'official_receipt_no' => $receiptNo,
            'amount_paid' => $amount,
            'payment_method' => $request->input('payment_method'),
            'payment_status' => 'verified',
            'transaction_date' => now(),
        ]);

        // --- SWIMLANE ACTIVITY DIAGRAM STEP: Cashier Issue Official Receipt -> Status becomes 'paid' / 'processing' ---
        $docRequest->processing_status = 'processing';
        $docRequest->save();

        AuditLog::record(
            $cashierId,
            'Official Receipt Issued',
            "Issued OR #{$receiptNo} of ₱{$amount} via {$payment->payment_method} for request #{$docRequest->tracking_number}"
        );

        return response()->json([
            'success' => true,
            'message' => "Official Receipt #{$receiptNo} successfully issued! Request status updated to Processing.",
            'payment' => [
                'id' => $payment->id,
                'official_receipt_no' => $payment->official_receipt_no,
                'amount_paid' => (float) $payment->amount_paid,
                'payment_method' => $payment->payment_method,
                'payment_status' => $payment->payment_status,
                'transaction_date' => $payment->transaction_date->format('Y-m-d H:i'),
            ],
            'request_status' => $docRequest->processing_status,
        ]);
    }
}
