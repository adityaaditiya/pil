<?php

namespace App\Http\Controllers;

use App\Models\MembershipPlan;
use App\Models\PilatesClass;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MembershipPlanController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Memberships/Plans/Index', [
            'plans' => MembershipPlan::query()
                ->withCount('classRules')
                ->latest()
                ->paginate(10),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/Memberships/Plans/Create', [
            'classes' => PilatesClass::query()->select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateRequest($request);
        $plan = MembershipPlan::create($data);
        $this->syncClassRules($plan, $request->input('class_rules', []));

        return to_route('membership-plans.index')->with('success', 'Paket membership berhasil dibuat.');
    }

    public function edit(MembershipPlan $membershipPlan): Response
    {
        $membershipPlan->load('classRules');

        return Inertia::render('Dashboard/Memberships/Plans/Edit', [
            'plan' => $membershipPlan,
            'classes' => PilatesClass::query()->select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, MembershipPlan $membershipPlan): RedirectResponse
    {
        $data = $this->validateRequest($request);
        $membershipPlan->update($data);
        $this->syncClassRules($membershipPlan, $request->input('class_rules', []));

        return to_route('membership-plans.index')->with('success', 'Paket membership berhasil diperbarui.');
    }

    public function destroy(MembershipPlan $membershipPlan): RedirectResponse
    {
        $membershipPlan->delete();

        return to_route('membership-plans.index')->with('success', 'Paket membership berhasil dihapus.');
    }

    private function validateRequest(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'credits' => ['required', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'valid_days' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
            'description' => ['nullable', 'string'],
            'class_rules' => ['nullable', 'array'],
            'class_rules.*.pilates_class_id' => ['required', 'integer', 'exists:pilates_classes,id'],
            'class_rules.*.credit_cost' => ['required', 'integer', 'min:1'],
        ]);
    }

    private function syncClassRules(MembershipPlan $plan, array $rules): void
    {
        $payload = collect($rules)
            ->filter(fn ($rule) => !empty($rule['pilates_class_id']))
            ->mapWithKeys(fn ($rule) => [
                (int) $rule['pilates_class_id'] => ['credit_cost' => max(1, (int) ($rule['credit_cost'] ?? 1))],
            ])
            ->all();

        $plan->classes()->sync($payload);
    }
}
