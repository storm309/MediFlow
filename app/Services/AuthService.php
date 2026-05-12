<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthService
{
    public function __construct(
        protected UserRepository $userRepo,
    ) {}

    /**
     * Register a new user (doctor or patient).
     */
    public function register(array $data): array
    {
        $user = $this->userRepo->create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'password'  => $data['password'],   // model casts 'hashed'
            'role'      => $data['role'] ?? 'patient',
            'phone'     => $data['phone'] ?? null,
            'is_active' => true,
        ]);

        $token = JWTAuth::fromUser($user);

        $this->logActivity($user->id, 'register', 'user', $user->id, "User registered: {$user->email}");

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Authenticate user and return JWT token.
     */
    public function login(array $credentials, string $ip = ''): array
    {
        if (!$token = JWTAuth::attempt($credentials)) {
            throw new \Exception('Invalid credentials.', 401);
        }

        $user = JWTAuth::user();

        if (!$user->is_active) {
            throw new \Exception('Account is deactivated. Please contact support.', 403);
        }

        $user->update(['last_login' => now()]);

        $this->logActivity($user->id, 'login', 'user', $user->id, "User logged in from {$ip}");

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Refresh JWT token.
     */
    public function refresh(): string
    {
        try {
            return JWTAuth::refresh(JWTAuth::getToken());
        } catch (JWTException $e) {
            throw new \Exception('Could not refresh token.', 401);
        }
    }

    /**
     * Logout (invalidate token).
     */
    public function logout(): void
    {
        $user = JWTAuth::user();
        JWTAuth::invalidate(JWTAuth::getToken());
        if ($user) {
            $this->logActivity($user->id, 'logout', 'user', $user->id, 'User logged out');
        }
    }

    /**
     * Initiate password reset flow.
     */
    public function forgotPassword(string $email): void
    {
        $user = $this->userRepo->findByEmail($email);
        if (!$user) return; // Silent for security

        $token = Str::random(64);
        $user->update([
            'password_reset_token'      => Hash::make($token),
            'password_reset_expires_at' => now()->addHour(),
        ]);

        // In production, dispatch a mail job instead:
        // Mail::to($user)->send(new PasswordResetMail($token));
    }

    /**
     * Reset password using token.
     */
    public function resetPassword(string $email, string $token, string $newPassword): void
    {
        $user = $this->userRepo->findByEmail($email);

        if (!$user
            || !$user->password_reset_token
            || !Hash::check($token, $user->password_reset_token)
            || now()->isAfter($user->password_reset_expires_at)
        ) {
            throw new \Exception('Invalid or expired password reset token.', 422);
        }

        $user->update([
            'password'                  => $newPassword,
            'password_reset_token'      => null,
            'password_reset_expires_at' => null,
        ]);
    }

    // ── Private Helpers ────────────────────────────────────────────────────────

    private function logActivity(string $userId, string $action, string $entityType, string $entityId, string $description): void
    {
        ActivityLog::create([
            'user_id'     => $userId,
            'action'      => $action,
            'entity_type' => $entityType,
            'entity_id'   => $entityId,
            'description' => $description,
        ]);
    }
}
