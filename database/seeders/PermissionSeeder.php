<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'dashboard-access',

            // users
            'users-access', 'users-create', 'users-update', 'users-delete',

            // roles
            'roles-access', 'roles-create', 'roles-update', 'roles-delete',

            // permissions
            'permissions-access', 'permissions-create', 'permissions-update', 'permissions-delete',

            // categories
            'categories-access', 'categories-create', 'categories-edit', 'categories-delete',

            // products
            'products-access', 'products-create', 'products-edit', 'products-delete',

            // customers
            'customers-access', 'customers-create', 'customers-edit', 'customers-delete',

            // class categories
            'class-categories-access', 'class-categories-create', 'class-categories-edit', 'class-categories-delete',

            // pilates studio control
            'studio-pages-access',
            'classes-access',
            'trainers-access',
            'appointment-sessions-access',
            'appointments-access',
            'appointments-history-access',
            'timetable-access',
            'bookings-history-access',
            'membership-plans-access',
            'memberships-access',
            'memberships-history-access',

            // transactions
            'transactions-access', 'my-transactions-access',

            // reports
            'reports-access', 'profits-access',

            // settings
            'payment-settings-access',
            'landing-page-settings-access',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }
    }
}
