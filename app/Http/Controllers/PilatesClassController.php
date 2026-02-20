<?php

namespace App\Http\Controllers;

use App\Models\PilatesClass;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PilatesClassController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Classes/Index', [
            'classes' => PilatesClass::when(request()->search, function ($query) {
                $search = request()->search;

                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('trainers', 'like', "%{$search}%")
                    ->orWhere('difficulty_level', 'like', "%{$search}%");
            })->latest()->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/Classes/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'image' => 'required|image|max:2048',
            'name' => 'required|string|max:255',
            'scheduled_at' => 'required|date',
            'slot' => 'required|integer|min:1',
            'duration' => 'required|integer|min:1',
            'difficulty_level' => 'required|in:Beginner,Intermediate,Advanced,Open to all',
            'about' => 'required|string',
            'equipment' => 'required|string',
            'trainers' => 'required|string|max:255',
            'credit' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
        ]);

        $image = $request->file('image');
        $image->storeAs('public/classes', $image->hashName());
        $data['image'] = $image->hashName();

        PilatesClass::create($data);

        return to_route('classes.index');
    }

    public function edit(PilatesClass $class): Response
    {
        return Inertia::render('Dashboard/Classes/Edit', [
            'classItem' => $class,
        ]);
    }

    public function update(Request $request, PilatesClass $class): RedirectResponse
    {
        $data = $request->validate([
            'image' => 'nullable|image|max:2048',
            'name' => 'required|string|max:255',
            'scheduled_at' => 'required|date',
            'slot' => 'required|integer|min:1',
            'duration' => 'required|integer|min:1',
            'difficulty_level' => 'required|in:Beginner,Intermediate,Advanced,Open to all',
            'about' => 'required|string',
            'equipment' => 'required|string',
            'trainers' => 'required|string|max:255',
            'credit' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
        ]);

        if ($request->file('image')) {
            Storage::disk('local')->delete('public/classes/' . basename($class->image));

            $image = $request->file('image');
            $image->storeAs('public/classes', $image->hashName());
            $data['image'] = $image->hashName();
        }

        $class->update($data);

        return to_route('classes.index');
    }

    public function destroy(PilatesClass $class): RedirectResponse
    {
        Storage::disk('local')->delete('public/classes/' . basename($class->image));
        $class->delete();

        return to_route('classes.index');
    }
}
