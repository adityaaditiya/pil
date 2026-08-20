<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Clear cached permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $modules = [
            'classes',
            'trainers',
            'timetable',
            'appointment-sessions',
            'appointments',
            'membership-plans',
            'memberships',
            'questions',
        ];

        $roles = Role::with('permissions')->get();

        foreach ($modules as $module) {
            $actions = ['create', 'edit', 'delete'];
            
            // Special case for memberships (no edit)
            if ($module === 'memberships') {
                $actions = ['create', 'delete'];
            }

            $newPermissions = [];
            foreach ($actions as $action) {
                $permissionName = "{$module}-{$action}";
                $newPermissions[] = Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
            }

            $accessPermissionName = "{$module}-access";

            foreach ($roles as $role) {
                if ($role->hasPermissionTo($accessPermissionName)) {
                    $role->givePermissionTo($newPermissions);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $modules = [
            'classes',
            'trainers',
            'timetable',
            'appointment-sessions',
            'appointments',
            'membership-plans',
            'memberships',
            'questions',
        ];

        foreach ($modules as $module) {
            $actions = ['create', 'edit', 'delete'];
            if ($module === 'memberships') {
                $actions = ['create', 'delete'];
            }

            foreach ($actions as $action) {
                $permission = Permission::where('name', "{$module}-{$action}")->first();
                if ($permission) {
                    $permission->delete();
                }
            }
        }
    }
};
