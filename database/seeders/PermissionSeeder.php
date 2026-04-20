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
            'view_supplier_payments',
            'add_supplier_payments',
            'edit_supplier_payments',
            'manage_supplier_payments',
            'manage_sales',
            'view_sales',
            'add_sales',
            'edit_sales',
            'delete_sales',
            'add_customer_payments',
            'edit_customer_payments',
            'view_customer_payments',
            'edit_customer_payments',
            'manage_customer_payments',
            'manage_purchase_returns',
            'add_purchase_returns',
            'edit_purchase_returns',
            'view_purchase_returns',
            'manage_sale_returns',
            'add_sale_returns',
            'edit_sale_returns',
            'view_sale_returns',
            'manage_customer_payments',
            'manage_expenses',
            'view_expenses',
            'add_expenses',
        ];
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }
    }
}
