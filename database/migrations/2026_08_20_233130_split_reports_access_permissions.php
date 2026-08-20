<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $newPermissions = [
            'report-sales-access',
            'report-sold-items-access',
            'report-booking-access',
            'report-appointment-access',
            'report-membership-access',
            'report-membership-extension-access',
            'report-membership-validity-access',
            'report-membership-transfer-access',
            'report-cash-access',
            'report-authorizations-access',
            'report-stock-mutations-access',
            'report-trainers-access',
        ];

        // Create new permissions
        foreach ($newPermissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // Migrate roles that had reports-access
        $oldPermission = Permission::where('name', 'reports-access')->first();
        if ($oldPermission) {
            $roles = Role::whereHas('permissions', function($q) {
                $q->where('name', 'reports-access');
            })->get();

            foreach ($roles as $role) {
                $role->givePermissionTo($newPermissions);
                $role->revokePermissionTo('reports-access');
            }
            
            // Delete old permission
            $oldPermission->delete();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Recreate old permission
        $oldPermission = Permission::firstOrCreate(['name' => 'reports-access', 'guard_name' => 'web']);

        $newPermissions = [
            'report-sales-access',
            'report-sold-items-access',
            'report-booking-access',
            'report-appointment-access',
            'report-membership-access',
            'report-membership-extension-access',
            'report-membership-validity-access',
            'report-membership-transfer-access',
            'report-cash-access',
            'report-authorizations-access',
            'report-stock-mutations-access',
            'report-trainers-access',
        ];

        // Migrate back to roles
        foreach ($newPermissions as $permName) {
            $perm = Permission::where('name', $permName)->first();
            if ($perm) {
                $roles = Role::whereHas('permissions', function($q) use ($permName) {
                    $q->where('name', $permName);
                })->get();

                foreach ($roles as $role) {
                    $role->givePermissionTo('reports-access');
                    $role->revokePermissionTo($permName);
                }
                $perm->delete();
            }
        }
    }
};
