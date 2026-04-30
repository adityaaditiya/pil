<?php

namespace App\Http\Controllers;

use Laravel\Socialite\Facades\Socialite;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class GoogleController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            // 🔥 wajib untuk local biar stabil
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = DB::transaction(function () use ($googleUser) {

                $appUser = User::where('google_id', $googleUser->id)->first();

                if (! $appUser) {
                    $appUser = User::updateOrCreate(
                        ['email' => $googleUser->email],
                        [
                            'name' => $googleUser->name,
                            'google_id' => $googleUser->id,
                            'provider' => 'google', // ✅ penting
                            'password' => Hash::make('dummy123'),
                        ]
                    );
                }

                Customer::firstOrCreate(
                    ['user_id' => $appUser->id],
                    [
                        'name' => $googleUser->name ?? $appUser->name,
                        'no_telp' => null,
                        'address' => null,
                        'date_of_birth' => null,
                        'credit' => 0,
                    ]
                );

                return $appUser;
            });

            Auth::login($user, true);
            request()->session()->regenerate();

            return redirect('/dashboard');

        } catch (\Exception $e) {
            return redirect('/login')->with('error', $e->getMessage());
        }
    }
}