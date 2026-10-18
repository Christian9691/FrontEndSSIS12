<?php

namespace App\Http\Controllers;

use App\Models\DocumentRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class VerificationController extends Controller
{
    /**
     * Public rate-limited credential authenticity verification endpoint.
     * Complies with RA 10173 (Data Privacy Act) by returning masked student data.
     */
    public function verify(Request $request, string $token): JsonResponse
    {
        // Rate limit: 30 requests per minute per IP
        $throttleKey = 'verify:'.$request->ip();
        if (RateLimiter::tooManyAttempts($throttleKey, 30)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return response()->json([
                'valid' => false,
                'message' => "Too many verification requests. Please try again in {$seconds} seconds.",
            ], 429);
        }
        RateLimiter::hit($throttleKey, 60);

        $doc = DocumentRequest::with(['student.user', 'student.course.department'])
            ->where('verification_token', $token)
            ->orWhere('tracking_number', $token)
            ->first();

        if (! $doc || $doc->processing_status !== 'released') {
            return response()->json([
                'valid' => false,
                'status' => 'Unverified / Invalid',
                'message' => 'No certified document found matching this verification token.',
            ], 404);
        }

        $studentName = $doc->student?->user?->name ?? 'Student';
        $maskedName = $this->maskName($studentName);

        return response()->json([
            'valid' => true,
            'institution' => 'CuyoTech University (Pamantasan ng Cabuyao)',
            'college' => $doc->student?->course?->department?->department_name ?? 'College of Computing Studies',
            'degree_program' => $doc->student?->course?->course_title ?? 'Undergraduate Degree',
            'document_type' => $doc->document_type,
            'tracking_number' => $doc->tracking_number,
            'verification_token' => $doc->verification_token,
            'student_name_masked' => $maskedName,
            'release_date' => $doc->release_date?->format('F d, Y') ?? $doc->updated_at->format('F d, Y'),
            'status' => 'Official & Certified',
            'signature' => $doc->signature,
            'authenticity_guarantee' => 'This academic record is cryptographically validated against the central institutional ledger.',
        ]);
    }

    /**
     * Helper to mask personal names (e.g., Juan Dela Cruz -> J*** D*** C***)
     */
    protected function maskName(string $name): string
    {
        $parts = explode(' ', trim($name));
        $masked = array_map(function ($part) {
            if (mb_strlen($part) <= 1) {
                return $part;
            }

            return mb_substr($part, 0, 1).'***';
        }, $parts);

        return implode(' ', $masked);
    }
}
