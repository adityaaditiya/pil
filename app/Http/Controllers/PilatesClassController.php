<?php

namespace App\Http\Controllers;

use App\Models\PilatesClass;
use App\Models\ClassCategory;
use App\Models\Trainer;
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
            'classes' => PilatesClass::with(['trainers', 'classCategory'])
                ->when(request()->search, function ($query) {
                    $search = request()->search;

                    $query->where(function ($subQuery) use ($search) {
                        $subQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('difficulty_level', 'like', "%{$search}%")
                            ->orWhereHas('classCategory', fn ($categoryQuery) => $categoryQuery->where('name', 'like', "%{$search}%"))
                            ->orWhereHas('trainers.user', fn ($trainerQuery) => $trainerQuery->where('name', 'like', "%{$search}%"))
                            ->orWhereHas('trainers.user.customer', fn ($customerQuery) => $customerQuery->where('name', 'like', "%{$search}%"));
                    });
                })
                ->latest()
                ->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/Classes/Create', [
            'trainers' => Trainer::query()
                ->forTrainerRole()
                ->with('user.customer')
                ->select('id', 'user_id')
                ->get()
                ->sortBy('name')
                ->values(),
            'classCategories' => ClassCategory::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'image' => 'required|image|max:2048',
            'class_category_id' => 'required|exists:class_categories,id',
            'name' => 'required|string|max:255',
            'duration' => 'required|integer|min:1',
            'difficulty_level' => 'required|in:Beginner,Intermediate,Advanced,Open to all',
            'about' => 'required|string',
            'equipment' => 'required|string',
            'available_for_timetable' => 'required|boolean',
            'available_for_appointment' => 'required|boolean',
            'default_payment_method' => 'required|in:drop_in,credit',
            'trainer_ids' => 'required|array|min:1',
            'trainer_ids.*' => 'required|exists:trainers,id',
        ]);

        $image = $request->file('image');
        $image->storeAs('public/classes', $image->hashName());
        $data['image'] = $image->hashName();

        $trainerIds = $data['trainer_ids'];
        unset($data['trainer_ids']);

        $class = PilatesClass::create($data);
        $class->trainers()->sync($trainerIds);

        return to_route('classes.index');
    }

    public function edit(PilatesClass $class): Response
    {
        return Inertia::render('Dashboard/Classes/Edit', [
            'classItem' => $class->load('trainers:id,user_id'),
            'trainers' => Trainer::query()
                ->forTrainerRole()
                ->with('user.customer')
                ->select('id', 'user_id')
                ->get()
                ->sortBy('name')
                ->values(),
            'classCategories' => ClassCategory::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, PilatesClass $class): RedirectResponse
    {
        $data = $request->validate([
            'image' => 'nullable|image|max:2048',
            'class_category_id' => 'required|exists:class_categories,id',
            'name' => 'required|string|max:255',
            'duration' => 'required|integer|min:1',
            'difficulty_level' => 'required|in:Beginner,Intermediate,Advanced,Open to all',
            'about' => 'required|string',
            'equipment' => 'required|string',
            'available_for_timetable' => 'required|boolean',
            'available_for_appointment' => 'required|boolean',
            'default_payment_method' => 'required|in:drop_in,credit',
            'trainer_ids' => 'required|array|min:1',
            'trainer_ids.*' => 'required|exists:trainers,id',
        ]);

        if ($request->file('image')) {
            Storage::disk('local')->delete('public/classes/' . basename($class->image));

            $image = $request->file('image');
            $image->storeAs('public/classes', $image->hashName());
            $data['image'] = $image->hashName();
        }

        $trainerIds = $data['trainer_ids'];
        unset($data['trainer_ids']);

        $class->update($data);
        $class->trainers()->sync($trainerIds);

        return to_route('classes.index');
    }

    public function destroy(PilatesClass $class): RedirectResponse
    {
        Storage::disk('local')->delete('public/classes/' . basename($class->image));
        $class->delete();

        return to_route('classes.index');
    }
}
