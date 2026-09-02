<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\LandingPageSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BusinessProfileController extends Controller
{
    public function edit()
    {
        $setting = LandingPageSetting::firstOrCreate([], LandingPageSetting::defaultAttributes());

        return Inertia::render('Dashboard/Settings/BusinessProfile', [
            'setting' => $setting
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'studio_name' => 'required|string|max:255',
        ]);

        $setting = LandingPageSetting::firstOrCreate([], LandingPageSetting::defaultAttributes());
        
        $setting->update([
            'studio_name' => $request->studio_name,
        ]);

        return back()->with('success', 'Profile Bisnis berhasil diperbarui.');
    }
}
