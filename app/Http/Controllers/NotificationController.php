<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /notifications — Current user's notifications.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->get('per_page', 20), 100);
        $unread  = $request->boolean('unread_only');

        $query = Notification::where('user_id', (string) $request->user()->_id);

        if ($unread) $query->where('is_read', false);

        $notifications = $query->latest()->paginate($perPage);
        $unreadCount   = Notification::where('user_id', (string) $request->user()->_id)
            ->where('is_read', false)->count();

        return response()->json([
            'success' => true,
            'data'    => $notifications,
            'meta'    => ['unread_count' => $unreadCount],
        ]);
    }

    /**
     * PATCH /notifications/{id}/read — Mark as read.
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $notification = Notification::where('user_id', (string) $request->user()->_id)
            ->findOrFail($id);

        $notification->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['success' => true, 'data' => $notification]);
    }

    /**
     * POST /notifications/mark-all-read — Mark all as read.
     */
    public function markAllRead(Request $request): JsonResponse
    {
        Notification::where('user_id', (string) $request->user()->_id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['success' => true, 'message' => 'All notifications marked as read.']);
    }

    /**
     * DELETE /notifications/{id} — Delete a notification.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        Notification::where('user_id', (string) $request->user()->_id)->findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Notification deleted.']);
    }
}
