<?php

namespace App\Http\Controllers;

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Tymon\JWTAuth\Facades\JWTAuth;

class SocialAuthController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'));

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect("{$frontendUrl}/auth/social?error=oauth_failed");
        }

        $user = User::where('email', $googleUser->getEmail())->first();

        if (!$user) {
            $user = User::create([
                'name'              => $googleUser->getName(),
                'email'             => $googleUser->getEmail(),
                'password'          => bcrypt(bin2hex(random_bytes(16))),
                'role'              => 'patient',
                'avatar'            => $googleUser->getAvatar(),
                'google_id'         => $googleUser->getId(),
                'email_verified_at' => now(),
                'is_active'         => true,
            ]);
            
            // Create patient profile for new patient
            \App\Models\Patient::create([
                'user_id'    => (string) $user->_id,
                'is_critical' => false,
            ]);
        } else {
            $updates = [];
            if (!$user->google_id) $updates['google_id'] = $googleUser->getId();
            if (!$user->avatar)    $updates['avatar']    = $googleUser->getAvatar();
            if ($updates)          $user->update($updates);
        }

        $token = JWTAuth::fromUser($user);

        return redirect("{$frontendUrl}/auth/social?" . http_build_query([
            'token' => $token,
            'role'  => $user->role,
            'name'  => $user->name,
        ]));
    }
}
