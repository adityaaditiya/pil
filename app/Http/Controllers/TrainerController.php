<?php

namespace App\Http\Controllers;

use App\Models\Trainer;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TrainerController extends Controller
{
    public function index(): Response
    {
        $trainers = User::query()
            ->role('trainer')
            ->with(['customer:id,user_id,photo,gender,date_of_birth,address'])
            ->when(request('search'), function ($query, $search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($customerQuery) use ($search) {
                            $customerQuery->where('gender', 'like', "%{$search}%")
                                ->orWhere('address', 'like', "%{$search}%");
                        });
                });
            })
            ->select('id', 'name')
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'photo' => $user->customer?->photo,
                    'gender' => $user->customer?->gender,
                    'date_of_birth' => optional($user->customer?->date_of_birth)?->toDateString(),
                    'address' => $user->customer?->address,
                ];
            });

        return Inertia::render('Dashboard/Trainers/Index', [
            'trainers' => $trainers,
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
            'date_of_birth' => 'required|date|before:today',
            'expertise' => 'required|string|max:255',
            'gender' => 'required|in:Laki-laki,Perempuan',
            'address' => 'required|string',
            'biodata' => 'required|string',
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
