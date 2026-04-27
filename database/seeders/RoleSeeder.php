<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    // Refactor the RoleSeeder to improve readability and avoid repetitive code
    public function run(): void
{
    // super admin (akses semua)
    $superAdmin = Role::firstOrCreate(['name' => 'super-admin']);
    $superAdmin->givePermissionTo(Permission::all());

    // cashier
    $cashier = Role::firstOrCreate(['name' => 'cashier']);
    // $cashier->givePermissionTo([
    //     'dashboard-access',
    //     'transactions-access',
    //     'customers-access',
    //     'customers-create',
    // ]);
    $cashier->givePermissionTo([
        'dashboard-access',
        'transactions-access',
        'customers-access',
        'customers-create',
        'customers-access', 'customers-create', 'customers-edit',
        'categories-access', 'categories-create', 'categories-edit',
        'products-access', 'products-create', 'products-edit',
        'class-categories-access', 'class-categories-create', 'class-categories-edit',
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
        'reports-access',
    ]);


    // customer
    $customer = Role::firstOrCreate(['name' => 'customer']);
    $customer->givePermissionTo([
        'my-transactions-access',
    ]);

    $trainer = Role::firstOrCreate(['name' => 'trainer']);
    $trainer->givePermissionTo([
        'my-transactions-access',
    ]);

    // trainer
    // $trainer = Role::firstOrCreate(['name' => 'trainer']);
    // $trainer->givePermissionTo([
    //     'dashboard-access',
    //     'trainers-access',
    // ]);
}
}
