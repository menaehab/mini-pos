<?php

namespace Tests\Feature;

use App\Enums\SaleTypeEnum;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Supplier;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardStatisticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_displays_expected_statistics_for_selected_period(): void
    {
        CarbonImmutable::setTestNow(CarbonImmutable::create(2026, 4, 20, 10, 0, 0));

        $user = User::factory()->create();
        $category = Category::query()->create(['name' => 'Beverages']);
        $supplier = Supplier::query()->create(['name' => 'Supplier One', 'phone' => '01000000000']);
        $customerOne = Customer::query()->create(['name' => 'Customer One']);
        $customerTwo = Customer::query()->create(['name' => 'Customer Two']);

        $productOne = Product::query()->create([
            'name' => 'Tea',
            'code' => 'P-001',
            'description' => 'Tea product',
            'purchase_price' => 20,
            'sale_price' => 40,
            'category_id' => $category->id,
        ]);

        $productTwo = Product::query()->create([
            'name' => 'Coffee',
            'code' => 'P-002',
            'description' => 'Coffee product',
            'purchase_price' => 30,
            'sale_price' => 50,
            'category_id' => $category->id,
        ]);

        $now = CarbonImmutable::now();
        $monthDate = $now->startOfMonth()->addDays(2);

        $purchaseOneId = DB::table('purchases')->insertGetId([
            'number' => 1001,
            'total_price' => 100,
            'supplier_name' => $supplier->name,
            'payment_type' => 'credit',
            'user_id' => $user->id,
            'supplier_id' => $supplier->id,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $purchaseTwoId = DB::table('purchases')->insertGetId([
            'number' => 1002,
            'total_price' => 80,
            'supplier_name' => $supplier->name,
            'payment_type' => 'credit',
            'user_id' => $user->id,
            'supplier_id' => $supplier->id,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('purchase_items')->insert([
            [
                'purchase_id' => $purchaseOneId,
                'item_name' => $productOne->name,
                'quantity' => 5,
                'purchase_price' => 20,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'purchase_id' => $purchaseTwoId,
                'item_name' => $productTwo->name,
                'quantity' => 20,
                'purchase_price' => 30,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        $supplierPaymentId = DB::table('supplier_payments')->insertGetId([
            'amount' => 60,
            'note' => null,
            'supplier_id' => $supplier->id,
            'user_id' => $user->id,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('supplier_payment_allocations')->insert([
            'is_first_payment' => true,
            'supplier_payment_id' => $supplierPaymentId,
            'purchase_id' => $purchaseOneId,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $saleOneId = DB::table('sales')->insertGetId([
            'total_price' => 200,
            'note' => null,
            'type' => SaleTypeEnum::CASH->value,
            'customer_name' => $customerOne->name,
            'installment_months' => null,
            'installment_amount' => null,
            'installment_rate' => null,
            'customer_id' => $customerOne->id,
            'user_id' => $user->id,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $saleTwoId = DB::table('sales')->insertGetId([
            'total_price' => 100,
            'note' => null,
            'type' => SaleTypeEnum::CASH->value,
            'customer_name' => $customerTwo->name,
            'installment_months' => null,
            'installment_amount' => null,
            'installment_rate' => null,
            'customer_id' => $customerTwo->id,
            'user_id' => $user->id,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $saleThreeId = DB::table('sales')->insertGetId([
            'total_price' => 40,
            'note' => null,
            'type' => SaleTypeEnum::CASH->value,
            'customer_name' => $customerTwo->name,
            'installment_months' => null,
            'installment_amount' => null,
            'installment_rate' => null,
            'customer_id' => $customerTwo->id,
            'user_id' => $user->id,
            'created_at' => $monthDate,
            'updated_at' => $monthDate,
        ]);

        DB::table('sale_items')->insert([
            [
                'product_name' => $productOne->name,
                'sale_price' => 40,
                'purchase_price' => 20,
                'quantity' => 3,
                'product_id' => $productOne->id,
                'sale_id' => $saleOneId,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'product_name' => $productTwo->name,
                'sale_price' => 40,
                'purchase_price' => 30,
                'quantity' => 2,
                'product_id' => $productTwo->id,
                'sale_id' => $saleOneId,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'product_name' => $productOne->name,
                'sale_price' => 100,
                'purchase_price' => 20,
                'quantity' => 1,
                'product_id' => $productOne->id,
                'sale_id' => $saleTwoId,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'product_name' => $productTwo->name,
                'sale_price' => 40,
                'purchase_price' => 30,
                'quantity' => 1,
                'product_id' => $productTwo->id,
                'sale_id' => $saleThreeId,
                'created_at' => $monthDate,
                'updated_at' => $monthDate,
            ],
        ]);

        $response = $this->actingAs($user)->get(route('home', [
            'period' => 'today',
            'low_stock_threshold' => 2,
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Home')
            ->where('filters.period', 'today')
            ->where('filters.low_stock_threshold', 2)
            ->where('salesOverview.today_total', fn ($value) => (float) $value === 300.0)
            ->where('salesOverview.month_total', fn ($value) => (float) $value === 340.0)
            ->where('salesOverview.invoices_count', 2)
            ->where('salesOverview.average_order_value', fn ($value) => (float) $value === 150.0)
            ->where('profitAndCost.total_revenue', fn ($value) => (float) $value === 300.0)
            ->where('profitAndCost.total_cost', fn ($value) => (float) $value === 140.0)
            ->where('profitAndCost.net_profit', fn ($value) => (float) $value === 160.0)
            ->where('products.total_count', 2)
            ->where('customers.total_count', 2)
            ->where('purchases.total_purchases', fn ($value) => (float) $value === 180.0)
            ->where('purchases.total_paid', fn ($value) => (float) $value === 60.0)
            ->where('purchases.total_unpaid', fn ($value) => (float) $value === 120.0)
            ->has('products.top_selling', 2)
            ->has('products.low_stock', 1)
            ->where('products.low_stock.0.name', 'Tea')
            ->where('products.low_stock.0.current_stock', fn ($value) => (float) $value === 1.0)
            ->has('customers.top_customers', 2)
            ->where('customers.top_customers.0.name', 'Customer One')
            ->where('customers.top_customers.0.total_purchases', fn ($value) => (float) $value === 200.0)
            ->has('charts.sales_last_7_days', 7)
            ->has('charts.top_products', 2));

        CarbonImmutable::setTestNow();
    }
}
