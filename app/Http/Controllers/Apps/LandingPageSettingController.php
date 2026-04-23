<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\LandingPageSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageSettingController extends Controller
{
    public function edit(): Response
    {
        $setting = LandingPageSetting::firstOrCreate([], LandingPageSetting::defaultAttributes());

        return Inertia::render('Dashboard/Settings/LandingPage', [
            'setting' => $setting,
        ]);
    }

    public function update(Request $request)
    {
        $setting = LandingPageSetting::firstOrCreate([], LandingPageSetting::defaultAttributes());

        $data = $request->validate([
            'hero_background_image' => ['nullable', 'image', 'max:4096'],
            'schedule_background_image' => ['nullable', 'image', 'max:4096'],
            'classes_background_image' => ['nullable', 'image', 'max:4096'],
            'studio_logo_image' => ['nullable', 'image', 'max:4096'],
        ]);

        $paths = [
            'hero_background_image' => $setting->hero_background_image,
            'schedule_background_image' => $setting->schedule_background_image,
            'classes_background_image' => $setting->classes_background_image,
            'studio_logo_image' => $setting->studio_logo_image,
        ];

        foreach (array_keys($paths) as $field) {
            if (! $request->hasFile($field)) {
                continue;
            }

            if (filled($setting->{$field}) && ! str_starts_with($setting->{$field}, 'http://') && ! str_starts_with($setting->{$field}, 'https://')) {
                Storage::disk('local')->delete('public/landing-page/' . basename($setting->{$field}));
            }

            $file = $request->file($field);
            $file->storeAs('public/landing-page', $file->hashName());
            $paths[$field] = $file->hashName();
        }

        $setting->update($paths);

        return redirect()
            ->route('settings.landing-page.edit')
            ->with('success', 'Pengaturan gambar landing page berhasil diperbarui.');
    }
}
