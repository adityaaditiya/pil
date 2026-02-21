<?php

namespace App\Http\Controllers;

use App\Models\Trainer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TrainerController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Trainers/Index', [
            'trainers' => Trainer::query()
                ->when(request('search'), function ($query, $search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('gender', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%");
                })
                ->latest()
                ->paginate(10)
                ->withQueryString(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/Trainers/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'photo' => 'required|image|max:2048',
            'age' => 'required|integer|min:1|max:120',
            'gender' => 'required|in:Laki-laki,Perempuan',
            'address' => 'required|string',
        ]);

        $photo = $request->file('photo');
        $photo->storeAs('public/trainers', $photo->hashName());
        $data['photo'] = $photo->hashName();

        Trainer::create($data);

        return to_route('trainers.index');
    }

    public function edit(Trainer $trainer): Response
    {
        return Inertia::render('Dashboard/Trainers/Edit', [
            'trainer' => $trainer,
        ]);
    }

    public function update(Request $request, Trainer $trainer): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'photo' => 'nullable|image|max:2048',
            'age' => 'required|integer|min:1|max:120',
            'gender' => 'required|in:Laki-laki,Perempuan',
            'address' => 'required|string',
        ]);

        if ($request->file('photo')) {
            if ($trainer->photo) {
                Storage::disk('local')->delete('public/trainers/' . basename($trainer->photo));
            }

            $photo = $request->file('photo');
            $photo->storeAs('public/trainers', $photo->hashName());
            $data['photo'] = $photo->hashName();
        }

        $trainer->update($data);

        return to_route('trainers.index');
    }

    public function destroy(Trainer $trainer): RedirectResponse
    {
        if ($trainer->photo) {
            Storage::disk('local')->delete('public/trainers/' . basename($trainer->photo));
        }

        $trainer->delete();

        return to_route('trainers.index');
    }
}
