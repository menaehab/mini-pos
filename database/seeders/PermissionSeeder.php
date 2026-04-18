<?php

namespace Database\Seeders;

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
            'manage_users',
            'view_users',
            'manage_suppliers',
            'view_suppliers',
            'manage_customers',
            'view_customers',
            'manage_categories',
            'view_categories',
            'manage_products',
            'view_products',
            'manage_purchases',
            'view_purchases',
            'add_purchases',
            'edit_purchases',
        ];
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }
    }
}
