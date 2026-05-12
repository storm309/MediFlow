<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle role-based access control.
     *
     * Usage in routes:  ->middleware('role:admin')
     *                   ->middleware('role:admin,doctor')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        if (!in_array($user->role, $roles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. You do not have access to this resource.',
            ], 403);
        }

        return $next($request);
    }
}
