<?php

namespace App\Http\Controllers;

use App\Models\Trainer;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
                ->with('user.customer')
                ->when(request('search'), function ($query, $search) {
                    $query->where(function ($subQuery) use ($search) {
                        $subQuery->where('biodata', 'like', "%{$search}%")
                            ->orWhere('expertise', 'like', "%{$search}%")
                            ->orWhereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$search}%"))
                            ->orWhereHas('user.customer', function ($customerQuery) use ($search) {
                                $customerQuery->where('name', 'like', "%{$search}%")
                                    ->orWhere('gender', 'like', "%{$search}%")
                                    ->orWhere('address', 'like', "%{$search}%");
                            });
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
                ->whereHas('customer')
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
            'expertise' => 'required|string|max:255',
            'biodata' => 'required|string',
        ]);

        $user = User::query()->role('trainer')->with('customer')->whereKey($data['user_id'])->first();
        abort_if(! $user, 422, 'User trainer tidak valid.');
        abort_if(! $user->customer, 422, 'Data pelanggan trainer tidak ditemukan.');

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
            'expertise' => 'required|string|max:255',
            'biodata' => 'required|string',
        ]);

        $trainer->load('user.customer');
        abort_if(! $trainer->user, 422, 'User trainer tidak valid.');
        abort_if(! $trainer->user?->customer, 422, 'Data pelanggan trainer tidak ditemukan.');

        $trainer->update($data);

        return to_route('trainers.index');
    }

    public function destroy(Trainer $trainer): RedirectResponse
    {
        $trainer->delete();

        return to_route('trainers.index');
    }
}
