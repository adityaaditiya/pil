<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AccountSettingController extends Controller
{
    /**
     * Show the account setting form.
     */
    public function edit(Request $request)
    {
        return Inertia::render('Dashboard/Settings/Account', [
            'user' => [
                'name' => $request->user()->name,
                'email' => $request->user()->email,
            ],
        ]);
    }

    /**
     * Update the user's account information.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();
        $user->name = $validated['name'];

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return redirect()->back()->with('success', 'Pengaturan akun berhasil diperbarui.');
    }
}
