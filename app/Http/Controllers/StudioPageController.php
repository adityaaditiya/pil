<?php

namespace App\Http\Controllers;

use App\Models\MembershipPlan;
use App\Models\PilatesClass;
use App\Models\PilatesTimetable;
use App\Models\StudioPage;
use App\Models\Trainer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudioPageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/StudioPages/Index', [
            'studioPages' => StudioPage::when(request()->search, function ($query) {
                $query->where('name', 'like', '%' . request()->search . '%')
                    ->orWhere('title', 'like', '%' . request()->search . '%');
            })->orderBy('id')->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/StudioPages/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'key' => 'required|string|max:255|alpha_dash|unique:studio_pages,key',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        StudioPage::create($request->only(['name', 'key', 'title', 'content']));

        return to_route('studio-pages.index');
    }

    public function edit(StudioPage $studioPage): Response
    {
        return Inertia::render('Dashboard/StudioPages/Edit', [
            'studioPage' => $studioPage,
        ]);
    }

    public function update(Request $request, StudioPage $studioPage): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'key' => 'required|string|max:255|alpha_dash|unique:studio_pages,key,' . $studioPage->id,
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $studioPage->update($request->only(['name', 'key', 'title', 'content']));

        return to_route('studio-pages.index');
    }

    public function destroy(StudioPage $studioPage): RedirectResponse
    {
        $studioPage->delete();

        return to_route('studio-pages.index');
    }

    public function showByKey(string $key): Response
    {
        $normalizedKey = $key === 'trainer' ? 'trainers' : $key;

        $page = StudioPage::where('key', $normalizedKey)->first();
        $menuItems = StudioPage::orderBy('id')->get(['name', 'key']);

        return Inertia::render('WelcomeSection', [
            'page' => $page,
            'pageKey' => $normalizedKey,
            'menuItems' => $menuItems,
            'classes' => $normalizedKey === 'classes'
                ? PilatesClass::with('trainers:id,name')->latest()->get(['id', 'image', 'name', 'duration', 'difficulty_level', 'about', 'equipment', 'price'])
                : [],
            'schedules' => $normalizedKey === 'schedule'
                ? PilatesTimetable::with(['pilatesClass:id,name,image', 'trainer:id,name'])
                    ->where('status', 'scheduled')
                    ->orderBy('start_at')
                    ->get(['id', 'pilates_class_id', 'trainer_id', 'start_at', 'capacity', 'duration_minutes', 'price_override', 'allow_drop_in'])
                : [],
            'memberships' => $normalizedKey === 'pricing'
                ? MembershipPlan::where('is_active', true)
                    ->orderBy('price')
                    ->get(['id', 'name', 'credits', 'price', 'valid_days', 'description'])
                : [],
            'trainers' => $normalizedKey === 'trainers'
                ? Trainer::latest()->get(['id', 'name', 'photo', 'age', 'gender', 'address'])
                : [],
        ]);
    }
}
