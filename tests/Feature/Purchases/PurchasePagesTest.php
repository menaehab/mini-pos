<?php

namespace Tests\Feature\Purchases;

use App\Models\Category;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Supplier;
use App\Models\SupplierPayment;
use App\Models\SupplierPaymentAllocation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class PurchasePagesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (['view_purchases', 'edit_purchases', 'manage_purchases'] as $permission) {
            Permission::findOrCreate($permission, 'web');
        }
    }

    public function test_show_page_renders_purchase_details_component(): void
    {
        $user = $this->authorizedUser();
        $purchase = $this->createPurchaseGraph($user);

        $response = $this->actingAs($user)->get(route('purchases.show', $purchase));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Purchases/Show')
            ->where('purchase.id', $purchase->id)
            ->has('purchase.items', 1)
            ->has('purchase.supplier')
        );
    }

    public function test_edit_page_renders_purchase_edit_component(): void
    {
        $user = $this->authorizedUser();
        $purchase = $this->createPurchaseGraph($user);

        $response = $this->actingAs($user)->get(route('purchases.edit', $purchase));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Purchases/Edit')
            ->where('purchase.id', $purchase->id)
            ->has('suppliers')
            ->has('products')
        );
    }

    public function test_update_purchase_updates_items_stock_and_payment_data(): void
    {
        $user = $this->authorizedUser();

        $oldSupplier = Supplier::create([
            'name' => 'Supplier Old',
            'phone' => '01000000001',
        ]);

        $newSupplier = Supplier::create([
            'name' => 'Supplier New',
            'phone' => '01000000002',
        ]);

        $category = Category::create(['name' => 'Cat']);

        $oldProduct = Product::create([
            'name' => 'Old Product',
            'code' => 'OLD-1',
            'description' => null,
            'purchase_price' => 10,
            'sale_price' => 15,
            'stock' => 10,
            'min_stock' => 0,
            'category_id' => $category->id,
        ]);

        $newProduct = Product::create([
            'name' => 'New Product',
            'code' => 'NEW-1',
            'description' => null,
            'purchase_price' => 20,
            'sale_price' => 30,
            'stock' => 10,
            'min_stock' => 0,
            'category_id' => $category->id,
        ]);

        $purchase = Purchase::withoutEvents(function () use ($oldSupplier, $user) {
            return Purchase::create([
                'number' => 1001,
                'total_price' => 20,
                'supplier_name' => $oldSupplier->name,
                'payment_type' => 'cash',
                'note' => null,
                'user_id' => $user->id,
                'supplier_id' => $oldSupplier->id,
            ]);
        });

        PurchaseItem::create([
            'purchase_id' => $purchase->id,
            'product_id' => $oldProduct->id,
            'item_name' => $oldProduct->name,
            'quantity' => 2,
            'purchase_price' => 10,
        ]);

        $oldPayment = SupplierPayment::create([
            'amount' => 20,
            'note' => 'old',
            'supplier_id' => $oldSupplier->id,
            'user_id' => $user->id,
        ]);

        SupplierPaymentAllocation::create([
            'is_first_payment' => true,
            'supplier_payment_id' => $oldPayment->id,
            'purchase_id' => $purchase->id,
        ]);

        $response = $this->actingAs($user)->put(route('purchases.update', $purchase), [
            'supplier_id' => $newSupplier->id,
            'payment_type' => 'credit',
            'amount' => 15,
            'payment_note' => 'updated',
            'note' => 'updated purchase',
            'items' => [
                [
                    'product_id' => $newProduct->id,
                    'item_name' => $newProduct->name,
                    'quantity' => 3,
                    'purchase_price' => 20,
                    'sale_price' => 35,
                ],
            ],
        ]);

        $response->assertRedirect(route('purchases.index'));

        $this->assertDatabaseHas('purchases', [
            'id' => $purchase->id,
            'supplier_id' => $newSupplier->id,
            'supplier_name' => $newSupplier->name,
            'payment_type' => 'credit',
            'total_price' => 60,
            'note' => 'updated purchase',
        ]);

        $this->assertDatabaseHas('purchase_items', [
            'purchase_id' => $purchase->id,
            'product_id' => $newProduct->id,
            'item_name' => $newProduct->name,
            'quantity' => 3,
            'purchase_price' => 20,
        ]);

        $this->assertDatabaseMissing('supplier_payments', [
            'id' => $oldPayment->id,
        ]);

        $this->assertDatabaseHas('supplier_payments', [
            'supplier_id' => $newSupplier->id,
            'amount' => 15,
            'note' => 'updated',
            'user_id' => $user->id,
        ]);

        $oldProduct->refresh();
        $newProduct->refresh();

        $this->assertSame(8, (int) $oldProduct->stock);
        $this->assertSame(13, (int) $newProduct->stock);
        $this->assertSame(20.0, (float) $newProduct->purchase_price);
        $this->assertSame(35.0, (float) $newProduct->sale_price);
    }

    private function authorizedUser(): User
    {
        $user = User::factory()->create();
        $user->givePermissionTo(['view_purchases', 'edit_purchases', 'manage_purchases']);

        return $user;
    }

    private function createPurchaseGraph(User $user): Purchase
    {
        $supplier = Supplier::create([
            'name' => 'Supplier A',
            'phone' => '01000000000',
        ]);

        $category = Category::create(['name' => 'Category A']);

        $product = Product::create([
            'name' => 'Product A',
            'code' => 'PRD-A',
            'description' => null,
            'purchase_price' => 25,
            'sale_price' => 40,
            'stock' => 5,
            'min_stock' => 0,
            'category_id' => $category->id,
        ]);

        $purchase = Purchase::withoutEvents(function () use ($supplier, $user) {
            return Purchase::create([
                'number' => 1000,
                'total_price' => 50,
                'supplier_name' => $supplier->name,
                'payment_type' => 'cash',
                'note' => null,
                'user_id' => $user->id,
                'supplier_id' => $supplier->id,
            ]);
        });

        PurchaseItem::create([
            'purchase_id' => $purchase->id,
            'product_id' => $product->id,
            'item_name' => $product->name,
            'quantity' => 2,
            'purchase_price' => 25,
        ]);

        return $purchase;
    }
}
