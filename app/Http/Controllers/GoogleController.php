<?php

namespace App\Http\Controllers;

use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
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
            $user = Socialite::driver('google')->user();
            
            // Cari user di database berdasarkan google_id
            $finduser = User::where('google_id', $user->id)->first();

            if($finduser){
                // Jika user sudah ada, langsung loginkan
                Auth::login($finduser);
                return redirect()->intended('dashboard');
            }else{
                // Jika user belum ada, buat user baru
                $newUser = User::updateOrCreate(['email' => $user->email],[
                    'name' => $user->name,
                    'google_id'=> $user->id,
                    'password' => encrypt('123456dummy') // password dummy
                ]);

                Auth::login($newUser);
                return redirect()->intended('dashboard');
            }
        } catch (Exception $e) {
            return redirect('login')->with('error', 'Gagal login dengan Google');
        }
    }
}
