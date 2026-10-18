<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get recent notifications for the authenticated user with unread count.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        // In non-production, fallback to role user if not authenticated
        if (! $user && ! app()->isProduction()) {
            $role = $request->header('X-User-Role') ?? 'student';
            $user = User::where('role', $role)->first();
        }

        if (! $user) {
            return response()->json([
                'notifications' => [],
                'unread_count' => 0,
            ]);
        }

        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(25)
            ->get()
            ->map(function ($n) {
                return [
                    'id' => $n->id,
                    'title' => $n->title,
                    'message' => $n->message,
                    'type' => $n->type,
                    'link' => $n->link,
                    'is_read' => (bool) $n->is_read,
                    'created_at' => $n->created_at->diffForHumans(),
                ];
            });

        $unreadCount = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(int $id): JsonResponse
    {
        $user = Auth::user();
        $notif = Notification::where('id', $id)->first();

        if ($notif && (! $user || $notif->user_id === $user->id || ! app()->isProduction())) {
            $notif->update(['is_read' => true]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications for the active user as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = Auth::user();
        if (! $user && ! app()->isProduction()) {
            $role = $request->header('X-User-Role') ?? 'student';
            $user = User::where('role', $role)->first();
        }

        if ($user) {
            Notification::where('user_id', $user->id)->update(['is_read' => true]);
        }

        return response()->json(['success' => true]);
    }
}
