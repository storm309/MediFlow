<?php

namespace App\Http\Controllers;

use App\Services\AuthService;
use App\Helpers\PhoneHelper;
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
            'role'      => 'sometimes|in:patient',  // Only patient can self-register
            'phone'     => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Prevent doctor registration - only admin can create doctors
        if ($request->get('role') === 'doctor') {
            return response()->json([
                'success' => false,
                'message' => 'Doctors cannot self-register. Please contact admin for doctor account creation.'
            ], 403);
        }

        try {
            $data = $validator->validated();
            // Format phone number with +91 prefix
            if (!empty($data['phone'])) {
                $data['phone'] = PhoneHelper::format($data['phone']);
                if ($data['phone'] === null) {
                    return response()->json([
                        'success' => false,
                        'errors' => ['phone' => ['Invalid phone number. Use Indian format (e.g., 9876543210 or +919876543210)']]
                    ], 422);
                }
            }

            $result = $this->authService->register($data);
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

            // Check if doctor is verified
            if ($result['user']->isDoctor() && !$result['user']->isDoctorVerified()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Doctor account pending verification. Admin will verify your credentials shortly. You will receive an email once approved.',
                    'verification_status' => $result['user']->verification_status,
                ], 403);
            }

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

        // Eager load patient profile for patients
        if ($user->isPatient()) {
            $user->load('patientProfile');
        }

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

    // ── Update Profile ────────────────────────────────────────────────────────

    public function updateProfile(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'  => 'sometimes|string|max:255',
            'phone' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $data = $validator->validated();
            // Format phone number with +91 prefix
            if (!empty($data['phone'])) {
                $data['phone'] = PhoneHelper::format($data['phone']);
                if ($data['phone'] === null) {
                    return response()->json([
                        'success' => false,
                        'errors' => ['phone' => ['Invalid phone number. Use Indian format (e.g., 9876543210 or +919876543210)']]
                    ], 422);
                }
            }

            $user = $request->user();
            $user->fill($data);
            $user->save();
            return response()->json(['success' => true, 'message' => 'Profile updated.', 'data' => $user]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ── Update Password ───────────────────────────────────────────────────────

    public function updatePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password'      => 'required|string',
            'password'              => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $user = $request->user();
            if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $user->password)) {
                return response()->json(['success' => false, 'message' => 'Current password is incorrect.'], 422);
            }
            $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
            $user->save();
            return response()->json(['success' => true, 'message' => 'Password changed successfully.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
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
