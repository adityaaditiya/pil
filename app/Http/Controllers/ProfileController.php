<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Customer;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $customer = Customer::query()
            ->where('user_id', $request->user()->id)
            ->first(['id', 'user_id', 'no_telp', 'address', 'gender', 'date_of_birth', 'photo']);

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'customer' => [
                'no_telp' => $customer?->no_telp,
                'address' => $customer?->address,
                'gender' => $customer?->gender,
                'date_of_birth' => optional($customer?->date_of_birth)->format('Y-m-d'),
                'photo' => $customer?->photo,
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $request->user()->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        $customer = Customer::query()->where('user_id', $request->user()->id)->first();

        $photoPath = $customer?->photo;

        if ($request->file('photo')) {
            if ($photoPath) {
                Storage::disk('local')->delete('public/customers/' . basename($photoPath));
            }

            $photo = $request->file('photo');
            $photo->storeAs('public/customers', $photo->hashName());
            $photoPath = $photo->hashName();
        }

        Customer::query()->updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'name' => $validated['name'],
                'no_telp' => $validated['no_telp'],
                'address' => $validated['address'],
                'gender' => $validated['gender'],
                'date_of_birth' => $validated['date_of_birth'],
                'photo' => $photoPath,
            ],
        );

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
