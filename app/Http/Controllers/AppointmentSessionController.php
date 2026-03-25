<?php

namespace App\Http\Controllers;

use App\Models\AppointmentSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentSessionController extends Controller
{
    public function index(Request $request): Response
    {
        $appointmentSessions = AppointmentSession::query()
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where('session_name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->orderBy('id', 'asc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Dashboard/AppointmentSessions/Index', [
            'appointmentSessions' => $appointmentSessions,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/AppointmentSessions/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'session_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'default_price_drop_in' => ['required', 'numeric', 'min:0'],
            'default_price_credit' => ['required', 'numeric', 'min:0'],
            'default_payment_method' => ['required', 'in:credit_only,allow_drop_in'],
        ]);

        AppointmentSession::query()->create($validated);

        return to_route('appointment-sessions.index')
            ->with('success', 'Sesi Appointment berhasil ditambahkan.');
    }

    public function edit(AppointmentSession $appointmentSession): Response
    {
        return Inertia::render('Dashboard/AppointmentSessions/Edit', [
            'appointmentSession' => $appointmentSession,
        ]);
    }

    public function update(Request $request, AppointmentSession $appointmentSession): RedirectResponse
    {
        $validated = $request->validate([
            'session_name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'default_price_drop_in' => ['required', 'numeric', 'min:0'],
            'default_price_credit' => ['required', 'numeric', 'min:0'],
            'default_payment_method' => ['required', 'in:credit_only,allow_drop_in'],
        ]);

        $appointmentSession->update($validated);

        return to_route('appointment-sessions.index')
            ->with('success', 'Sesi Appointment berhasil diperbarui.');
    }

    public function destroy(AppointmentSession $appointmentSession): RedirectResponse
    {
        $appointmentSession->delete();

        return to_route('appointment-sessions.index')
            ->with('success', 'Sesi Appointment berhasil dihapus.');
    }
}
