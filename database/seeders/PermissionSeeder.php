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
            'manage_supplier_payments',
            'add_supplier_payments',
            'edit_supplier_payments',
            'view_supplier_payments',
            'create_supplier_payments',
            'update_supplier_payments',
            'manage_supplier_payments',
        ];
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }
    }
}
