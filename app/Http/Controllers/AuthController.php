<?php

namespace App\Http\Controllers;

use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function __construct(protected AuthService $authService) {}

    // ── Register ──────────────────────────────────────────────────────────────

    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|unique:mongodb.users,email',
            'password'  => 'required|string|min:8|confirmed',
            'role'      => 'sometimes|in:doctor,patient',
            'phone'     => 'sometimes|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->authService->register($validator->validated());
            return response()->json([
                'success' => true,
                'message' => 'Registration successful.',
                'data'    => [
                    'user'  => $result['user'],
                    'token' => $result['token'],
                    'token_type' => 'Bearer',
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $result = $this->authService->login(
                $validator->validated(),
                $request->ip()
            );
            return response()->json([
                'success' => true,
                'message' => 'Login successful.',
                'data'    => [
                    'user'       => $result['user'],
                    'token'      => $result['token'],
                    'token_type' => 'Bearer',
                    'expires_in' => config('jwt.ttl') * 60,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], $e->getCode() ?: 401);
        }
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    public function logout(): JsonResponse
    {
        try {
            $this->authService->logout();
            return response()->json(['success' => true, 'message' => 'Successfully logged out.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ── Refresh Token ─────────────────────────────────────────────────────────

    public function refresh(): JsonResponse
    {
        try {
            $token = $this->authService->refresh();
            return response()->json([
                'success' => true,
                'data'    => ['token' => $token, 'token_type' => 'Bearer'],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 401);
        }
    }

    // ── Me ────────────────────────────────────────────────────────────────────

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $user->toArray();

        if ($user->isPatient()) {
            $data['patient_profile'] = $user->patientProfile;
        }

        return response()->json(['success' => true, 'data' => $data]);
    }

    // ── Forgot Password ───────────────────────────────────────────────────────

    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $this->authService->forgotPassword($request->email);

        return response()->json([
            'success' => true,
            'message' => 'If an account exists with this email, a reset link has been sent.',
        ]);
    }

    // ── Reset Password ────────────────────────────────────────────────────────

    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email'                 => 'required|email',
            'token'                 => 'required|string',
            'password'              => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $this->authService->resetPassword(
                $request->email,
                $request->token,
                $request->password
            );
            return response()->json(['success' => true, 'message' => 'Password reset successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }
}
