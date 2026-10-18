<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\DocumentRequest;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
        $user = Auth::user();
        if ($user && ! in_array($user->role, ['cashier', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only Cashier officers or Administrators can issue Official Receipts.',
            ], 403);
        }

        $request->validate([
            'document_request_id' => 'required|exists:document_requests,id',
            'amount_paid' => 'nullable|numeric|min:1',
            'payment_method' => 'required|in:cash,online,bank_transfer',
            'official_receipt_no' => 'nullable|string|max:50',
        ]);

        return DB::transaction(function () use ($request) {
            $docRequest = DocumentRequest::with('payment')
                ->lockForUpdate()
                ->findOrFail($request->input('document_request_id'));

            if ($docRequest->payment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Official Receipt already issued for this request.',
                ], 422);
            }

            $receiptNo = $request->input('official_receipt_no') ?: Payment::generateReceiptNumber();
            $amount = $request->input('amount_paid') ?: $docRequest->assessment_fee;
            $cashierId = Auth::id() ?? 3; // Default to Cashier User if testing

            $payment = Payment::create([
                'document_request_id' => $docRequest->id,
                'processed_by_user_id' => $cashierId,
                'official_receipt_no' => $receiptNo,
                'amount_paid' => $amount,
                'payment_method' => $request->input('payment_method'),
                'payment_status' => 'verified',
                'transaction_date' => now(),
            ]);

            // --- SWIMLANE ACTIVITY DIAGRAM STEP: Cashier Issue Official Receipt -> Status becomes 'processing' ---
            $docRequest->processing_status = 'processing';
            $docRequest->save();

            // Notify student of payment verification and OR issuance
            if ($docRequest->student?->user_id) {
                Notification::send(
                    $docRequest->student->user_id,
                    'Payment Verified & OR Issued',
                    "Official Receipt #{$receiptNo} issued for ₱{$amount}. Your document request is now Processing.",
                    'payment',
                    '/student/requests'
                );
            }

            // Notify Registrar queue
            $regUser = User::where('role', 'registrar')->first();
            if ($regUser) {
                Notification::send(
                    $regUser->id,
                    'New Document Ready for Processing',
                    "Request #{$docRequest->tracking_number} has been paid and is queued for processing.",
                    'document',
                    '/registrar'
                );
            }

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
        });
    }

    /**
     * Export daily collections summary for Commission on Audit (COA) / SUC accounting reconciliation.
     */
    public function exportCoa(Request $request): StreamedResponse
    {
        $payments = Payment::with(['documentRequest.student.user', 'documentRequest.student.course', 'processedBy'])
            ->orderBy('transaction_date', 'desc')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="COA_Daily_Collection_Report_'.date('Ymd_His').'.csv"',
        ];

        return response()->stream(function () use ($payments) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Official Receipt No', 'Tracking Number', 'Student Number', 'Student Name', 'Program', 'Document Type', 'Payment Method', 'Amount (PHP)', 'Transaction Date', 'Cashier']);

            foreach ($payments as $p) {
                fputcsv($handle, [
                    $p->official_receipt_no,
                    $p->documentRequest->tracking_number ?? 'N/A',
                    $p->documentRequest->student->student_number ?? 'N/A',
                    $p->documentRequest->student->user->name ?? 'N/A',
                    $p->documentRequest->student->course->course_code ?? 'N/A',
                    $p->documentRequest->document_type ?? 'N/A',
                    strtoupper($p->payment_method),
                    number_format((float) $p->amount_paid, 2, '.', ''),
                    $p->transaction_date?->format('Y-m-d H:i:s') ?? '',
                    $p->processedBy->name ?? 'Cashier Office',
                ]);
            }
            fclose($handle);
        }, 200, $headers);
    }
}
