<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\ClassCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ClassCategoryController extends Controller
{
    public function index()
    {
        $classCategories = ClassCategory::when(request()->search, function ($query) {
            $query->where('name', 'like', '%' . request()->search . '%');
        })->latest()->paginate(10);

        return Inertia::render('Dashboard/ClassCategories/Index', [
            'classCategories' => $classCategories,
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/ClassCategories/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png|max:2048',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $image = $request->file('image');
        $image->storeAs('public/class-categories', $image->hashName());

        ClassCategory::create([
            'image' => $image->hashName(),
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return to_route('class-categories.index');
    }

    public function edit(ClassCategory $classCategory)
    {
        return Inertia::render('Dashboard/ClassCategories/Edit', [
            'classCategory' => $classCategory,
        ]);
    }

    public function update(Request $request, ClassCategory $classCategory)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
        ]);

        if ($request->file('image')) {
            Storage::disk('local')->delete('public/class-categories/' . basename($classCategory->getRawOriginal('image')));

            $image = $request->file('image');
            $image->storeAs('public/class-categories', $image->hashName());

            $classCategory->update([
                'image' => $image->hashName(),
                'name' => $request->name,
                'description' => $request->description,
            ]);

            return to_route('class-categories.index');
        }

        $classCategory->update([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return to_route('class-categories.index');
    }

    public function destroy(ClassCategory $classCategory)
    {
        Storage::disk('local')->delete('public/class-categories/' . basename($classCategory->getRawOriginal('image')));
        $classCategory->delete();

        return to_route('class-categories.index');
    }
}
