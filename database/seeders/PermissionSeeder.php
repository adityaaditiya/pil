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
            'classes-access', 'classes-create', 'classes-edit', 'classes-delete',
            'trainers-access', 'trainers-create', 'trainers-edit', 'trainers-delete',
            'appointment-sessions-access', 'appointment-sessions-create', 'appointment-sessions-edit', 'appointment-sessions-delete',
            'appointments-access', 'appointments-create', 'appointments-edit', 'appointments-delete', 'appointments-booking-create',
            'appointments-history-access',
            'timetable-access', 'timetable-create', 'timetable-edit', 'timetable-delete',
            'bookings-history-access',
            'membership-plans-access', 'membership-plans-create', 'membership-plans-edit', 'membership-plans-delete',
            'memberships-access', 'memberships-create', 'memberships-delete',
            'membership-transfer-access',
            'membership-extension-access',
            'my-memberships-access',
            'memberships-history-access',

            // transactions
            'transactions-access', 'my-transactions-access',

            // questionnaires
            'questions-access', 'questions-create', 'questions-edit', 'questions-delete',

            // authorizations
            'authorization-cancel-transactions',

            // reports
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
            'profits-access',

            // settings
            'payment-activation-access',
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
