<?php

namespace App\Http\Controllers;

use Laravel\Socialite\Facades\Socialite;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Exception;

class GoogleController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            $user = DB::transaction(function () use ($googleUser) {
                $appUser = User::where('google_id', $googleUser->id)->first();

                if (! $appUser) {
                    $appUser = User::updateOrCreate(
                        ['email' => $googleUser->email],
                        [
                            'name' => $googleUser->name,
                            'google_id' => $googleUser->id,
                            'password' => encrypt('123456dummy'),
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
                        'credit' => 0.00,
                    ]
                );

                return $appUser;
            });

            Auth::login($user);
            return redirect()->intended('dashboard');
        } catch (Exception $e) {
            return redirect('login')->with('error', 'Gagal login dengan Google');
        }
    }
}
