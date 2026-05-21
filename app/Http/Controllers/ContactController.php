<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    /**
     * POST /contact-admin
     * Public endpoint — doctor sends a contact request to the admin.
     */
    public function send(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'phone'   => 'sometimes|nullable|string|max:20',
            'message' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // Always persist the contact request to DB so admin can see it even if email fails
        \App\Models\ActivityLog::create([
            'user_id'     => null,
            'action'      => 'contact_request',
            'entity_type' => 'contact',
            'entity_id'   => null,
            'description' => "Doctor registration request from {$data['name']} ({$data['email']})",
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->userAgent(),
            'metadata'    => [
                'name'    => $data['name'],
                'email'   => $data['email'],
                'phone'   => $data['phone'] ?? null,
                'message' => $data['message'],
            ],
        ]);

        // Prefer configured admin email, else fall back to a master admin in DB
        $adminEmail = config('mail.admin_address')
            ?: optional(\App\Models\User::where('role', 'admin')->orderBy('created_at', 'asc')->first())->email
            ?: 'shivamkumarp447@gmail.com';

        $body = "New Doctor Registration Request on MediFlow\n";
        $body .= str_repeat("─", 50) . "\n\n";
        $body .= "Name    : {$data['name']}\n";
        $body .= "Email   : {$data['email']}\n";
        $body .= "Phone   : " . ($data['phone'] ?? 'Not provided') . "\n\n";
        $body .= "Message :\n{$data['message']}\n\n";
        $body .= str_repeat("─", 50) . "\n";
        $body .= "Please create a doctor account for this user via the Admin panel.\n";
        $body .= "MediFlow Admin Panel\n";

        // Attempt email — silently ignore failures (message is already saved to DB)
        try {
            Mail::raw($body, function ($mail) use ($adminEmail, $data) {
                $mail->to($adminEmail)
                     ->subject("Doctor Registration Request — {$data['name']}")
                     ->replyTo($data['email'], $data['name']);
            });
        } catch (\Exception $e) {
            // Email failed but request is saved in activity_logs — admin will see it
        }

        return response()->json([
            'success' => true,
            'message' => 'Your request has been sent to the admin. You will be contacted soon.',
        ]);
    }
}
