<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'redirect' => $request->query('redirect'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $redirect = trim((string) $request->input('redirect', ''));

        if ($redirect !== '' && str_starts_with($redirect, '/')) {
            $request->session()->put('url.intended', $redirect);
        }

        $request->authenticate();

        $request->session()->regenerate();

        if ($request->user()->hasRole('customer')) {
            return redirect()->intended(route('welcome', absolute: false));
        }

        if ($request->user()->hasRole('trainer')) {
            return redirect()->intended(route('user.my-flow', absolute: false));
        }

        if ($request->user()->can('dashboard-access')) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        if ($request->user()->can('my-transactions-access')) {
            return redirect()->intended(route('transactions.my', absolute: false));
        }

        return redirect()->intended(route('welcome', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
