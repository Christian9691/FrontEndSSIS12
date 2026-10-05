<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ResolveHeaderUser
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check() && $request->hasHeader('X-User-Id')) {
            $userId = (int) $request->header('X-User-Id');
            $user = User::find($userId);
            if ($user && $user->status === 'active') {
                Auth::setUser($user);
            }
        }

        return $next($request);
    }
}
