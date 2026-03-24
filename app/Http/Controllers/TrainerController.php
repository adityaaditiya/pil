<?php

namespace App\Http\Controllers;

use App\Models\Trainer;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TrainerController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Trainers/Index', [
            'trainers' => Trainer::query()
                ->forTrainerRole()
                ->with('user:id,name')
                ->when(request('search'), function ($query, $search) {
                    $query->where(function ($subQuery) use ($search) {
                        $subQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('gender', 'like', "%{$search}%")
                            ->orWhere('address', 'like', "%{$search}%")
                            ->orWhere('biodata', 'like', "%{$search}%")
                            ->orWhereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$search}%"));
                    });
                })
                ->latest()
                ->paginate(10)
                ->withQueryString(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/Trainers/Create', [
            'trainerUsers' => User::query()
                ->role('trainer')
                ->whereDoesntHave('trainer')
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'user_id' => [
                'required',
                Rule::exists('users', 'id'),
                Rule::unique('trainers', 'user_id'),
            ],
            'photo' => 'required|image|max:2048',
            'date_of_birth' => 'required|date|before:today',
            'expertise' => 'required|string|max:255',
            'gender' => 'required|in:Laki-laki,Perempuan',
            'address' => 'required|string',
            'biodata' => 'required|string',
        ]);

        $photo = $request->file('photo');
        $photo->storeAs('public/trainers', $photo->hashName());
        $data['photo'] = $photo->hashName();
        $data['name'] = User::query()->role('trainer')->whereKey($data['user_id'])->value('name');

        abort_if(! $data['name'], 422, 'User trainer tidak valid.');

        Trainer::create($data);

        return to_route('trainers.index');
    }

    public function edit(Trainer $trainer): Response
    {
        return Inertia::render('Dashboard/Trainers/Edit', [
            'trainer' => $trainer->load('user:id,name,email'),
        ]);
    }

    public function update(Request $request, Trainer $trainer): RedirectResponse
    {
        $data = $request->validate([
            'photo' => 'nullable|image|max:2048',
            'date_of_birth' => 'required|date|before:today',
            'expertise' => 'required|string|max:255',
            'gender' => 'required|in:Laki-laki,Perempuan',
            'address' => 'required|string',
            'biodata' => 'required|string',
        ]);

        if ($request->file('photo')) {
            if ($trainer->photo) {
                Storage::disk('local')->delete('public/trainers/' . basename($trainer->photo));
            }

            $photo = $request->file('photo');
            $photo->storeAs('public/trainers', $photo->hashName());
            $data['photo'] = $photo->hashName();
        }

        $trainerName = $trainer->user()->role('trainer')->value('name');
        abort_if(! $trainerName, 422, 'User trainer tidak valid.');
        $data['name'] = $trainerName;

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
