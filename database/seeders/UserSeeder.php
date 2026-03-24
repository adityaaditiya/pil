<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ========================
        // SUPER ADMIN
        // ========================
        $user = User::firstOrCreate(
            ['email' => 'aditya@gmail.com'],
            [
                'name' => 'Aditya',
                'password' => bcrypt('poskamplingpadel'),
            ]
        );

        $role = Role::where('name', 'super-admin')->first();
        $permissions = Permission::all();

        if ($role) {
            $user->syncRoles([$role]); // reset + assign role
        }

        $user->syncPermissions($permissions); // semua permission

        // ========================
        // CASHIER
        // ========================
        $cashier = User::firstOrCreate(
            ['email' => 'cashier@gmail.com'],
            [
                'name' => 'cashier',
                'password' => bcrypt('Orokasir123'),
            ]
        );

        $cashierRole = Role::where('name', 'cashier')->first();

        if ($cashierRole) {
            $cashier->syncRoles([$cashierRole]);
        }
    }
}