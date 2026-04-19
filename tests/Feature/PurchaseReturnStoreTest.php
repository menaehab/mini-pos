<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\PurchaseReturn;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class PurchaseReturnStoreTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware([
            ValidateCsrfToken::class,
            VerifyCsrfToken::class,
        ]);
    }

    public function test_user_can_store_purchase_return_when_quantities_are_valid(): void
    {
        $user = User::factory()->create();
        Permission::findOrCreate('manage_purchases');
        $user->givePermissionTo('manage_purchases');

        $category = Category::create(['name' => 'General']);

        $productA = Product::create([
            'name' => 'Product A',
            'code' => 'PA-001',
            'purchase_price' => 10,
            'sale_price' => 14,
            'category_id' => $category->id,
        ]);

        $productB = Product::create([
            'name' => 'Product B',
            'code' => 'PB-001',
            'purchase_price' => 8,
            'sale_price' => 12,
            'category_id' => $category->id,
        ]);

        $purchase = Purchase::create([
            'number' => 1001,
            'supplier_name' => 'Test Supplier',
            'payment_type' => 'cash',
            'total_price' => 0,
            'user_id' => $user->id,
        ]);

        PurchaseItem::create([
            'purchase_id' => $purchase->id,
            'item_name' => $productA->name,
            'quantity' => 5,
            'purchase_price' => 10,
        ]);

        PurchaseItem::create([
            'purchase_id' => $purchase->id,
            'item_name' => $productB->name,
            'quantity' => 3,
            'purchase_price' => 8,
        ]);

        $response = $this->actingAs($user)->withSession(['_token' => 'test-token'])->post('/purchase-returns', [
            '_token' => 'test-token',
            'purchase_id' => $purchase->id,
            'items' => [
                ['product_id' => $productA->id, 'quantity' => 2],
                ['product_id' => $productB->id, 'quantity' => 1],
            ],
            'is_refunded' => true,
            'note' => 'Damaged package',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('purchase_returns', [
            'purchase_id' => $purchase->id,
            'user_id' => $user->id,
            'is_refunded' => 1,
            'note' => 'Damaged package',
            'total_price' => 28.00,
        ]);

        $purchaseReturn = PurchaseReturn::query()->where('purchase_id', $purchase->id)->firstOrFail();

        $this->assertDatabaseHas('purchase_return_items', [
            'purchase_return_id' => $purchaseReturn->id,
            'product_id' => $productA->id,
            'quantity' => 2,
            'purchase_price' => 10.00,
        ]);

        $this->assertDatabaseHas('purchase_return_items', [
            'purchase_return_id' => $purchaseReturn->id,
            'product_id' => $productB->id,
            'quantity' => 1,
            'purchase_price' => 8.00,
        ]);
    }

    public function test_user_cannot_return_more_than_invoice_quantity(): void
    {
        $user = User::factory()->create();
        Permission::findOrCreate('manage_purchases');
        $user->givePermissionTo('manage_purchases');

        $category = Category::create(['name' => 'General']);

        $product = Product::create([
            'name' => 'Product A',
            'code' => 'PA-001',
            'purchase_price' => 10,
            'sale_price' => 14,
            'category_id' => $category->id,
        ]);

        $purchase = Purchase::create([
            'number' => 1002,
            'supplier_name' => 'Test Supplier',
            'payment_type' => 'cash',
            'total_price' => 0,
            'user_id' => $user->id,
        ]);

        PurchaseItem::create([
            'purchase_id' => $purchase->id,
            'item_name' => $product->name,
            'quantity' => 5,
            'purchase_price' => 10,
        ]);

        $response = $this->actingAs($user)->withSession(['_token' => 'test-token'])->from('/')->post('/purchase-returns', [
            '_token' => 'test-token',
            'purchase_id' => $purchase->id,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 6],
            ],
            'is_refunded' => false,
            'note' => 'Too much',
        ]);

        $response->assertRedirect('/');
        $response->assertSessionHasErrors('items');

        $this->assertDatabaseCount('purchase_returns', 0);
    }

    public function test_purchase_return_index_can_search_and_filter(): void
    {
        $user = User::factory()->create();
        Permission::findOrCreate('view_purchases');
        $user->givePermissionTo('view_purchases');

        $supplierA = Supplier::create([
            'name' => 'Acme Supplier',
            'phone' => '1111',
        ]);

        $supplierB = Supplier::create([
            'name' => 'Beta Supplier',
            'phone' => '2222',
        ]);

        $purchaseA = Purchase::create([
            'number' => 3001,
            'supplier_name' => $supplierA->name,
            'payment_type' => 'cash',
            'total_price' => 0,
            'supplier_id' => $supplierA->id,
            'user_id' => $user->id,
        ]);

        $purchaseB = Purchase::create([
            'number' => 4001,
            'supplier_name' => $supplierB->name,
            'payment_type' => 'cash',
            'total_price' => 0,
            'supplier_id' => $supplierB->id,
            'user_id' => $user->id,
        ]);

        PurchaseReturn::create([
            'number' => 'PR-A-1',
            'total_price' => 10,
            'note' => null,
            'is_refunded' => false,
            'user_id' => $user->id,
            'purchase_id' => $purchaseA->id,
        ]);

        PurchaseReturn::create([
            'number' => 'PR-B-1',
            'total_price' => 20,
            'note' => null,
            'is_refunded' => false,
            'user_id' => $user->id,
            'purchase_id' => $purchaseB->id,
        ]);

        $searchResponse = $this->actingAs($user)->get('/purchase-returns?search=Acme');

        $searchResponse->assertOk();
        $searchResponse->assertInertia(fn (Assert $page) => $page
            ->component('PurchaseReturns/Index')
            ->has('purchaseReturns.data', 1)
            ->where('purchaseReturns.data.0.purchase.number', $purchaseA->number)
            ->where('filters.search', 'Acme')
        );

        $filterResponse = $this->actingAs($user)->get('/purchase-returns?supplier_id='.$supplierB->id);

        $filterResponse->assertOk();
        $filterResponse->assertInertia(fn (Assert $page) => $page
            ->component('PurchaseReturns/Index')
            ->has('purchaseReturns.data', 1)
            ->where('purchaseReturns.data.0.purchase.supplier_id', $supplierB->id)
            ->where('filters.supplier_id', (string) $supplierB->id)
        );
    }

    public function test_user_can_update_purchase_return_invoice(): void
    {
        $user = User::factory()->create();
        Permission::findOrCreate('manage_purchases');
        $user->givePermissionTo('manage_purchases');

        $category = Category::create(['name' => 'General']);

        $productA = Product::create([
            'name' => 'Product A',
            'code' => 'PA-001',
            'purchase_price' => 10,
            'sale_price' => 14,
            'category_id' => $category->id,
        ]);

        $productB = Product::create([
            'name' => 'Product B',
            'code' => 'PB-001',
            'purchase_price' => 8,
            'sale_price' => 12,
            'category_id' => $category->id,
        ]);

        $purchase = Purchase::create([
            'number' => 5001,
            'supplier_name' => 'Test Supplier',
            'payment_type' => 'cash',
            'total_price' => 0,
            'user_id' => $user->id,
        ]);

        PurchaseItem::create([
            'purchase_id' => $purchase->id,
            'item_name' => $productA->name,
            'quantity' => 5,
            'purchase_price' => 10,
        ]);

        PurchaseItem::create([
            'purchase_id' => $purchase->id,
            'item_name' => $productB->name,
            'quantity' => 3,
            'purchase_price' => 8,
        ]);

        $purchaseReturn = PurchaseReturn::create([
            'number' => 'PR-UP-1',
            'total_price' => 20,
            'note' => 'Old note',
            'is_refunded' => false,
            'user_id' => $user->id,
            'purchase_id' => $purchase->id,
        ]);

        $purchaseReturn->items()->create([
            'product_id' => $productA->id,
            'product_name' => $productA->name,
            'purchase_price' => 10,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($user)
            ->withSession(['_token' => 'test-token'])
            ->put('/purchase-returns/'.$purchaseReturn->id, [
                '_token' => 'test-token',
                'purchase_id' => $purchase->id,
                'items' => [
                    ['product_id' => $productA->id, 'quantity' => 1],
                    ['product_id' => $productB->id, 'quantity' => 2],
                ],
                'is_refunded' => true,
                'note' => 'Updated note',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('purchase_returns', [
            'id' => $purchaseReturn->id,
            'note' => 'Updated note',
            'is_refunded' => 1,
            'total_price' => 26.00,
        ]);

        $this->assertDatabaseCount('purchase_return_items', 2);
        $this->assertDatabaseHas('purchase_return_items', [
            'purchase_return_id' => $purchaseReturn->id,
            'product_id' => $productA->id,
            'quantity' => 1,
        ]);
        $this->assertDatabaseHas('purchase_return_items', [
            'purchase_return_id' => $purchaseReturn->id,
            'product_id' => $productB->id,
            'quantity' => 2,
        ]);
    }

    public function test_user_cannot_update_purchase_return_with_over_quantity(): void
    {
        $user = User::factory()->create();
        Permission::findOrCreate('manage_purchases');
        $user->givePermissionTo('manage_purchases');

        $category = Category::create(['name' => 'General']);

        $product = Product::create([
            'name' => 'Product A',
            'code' => 'PA-001',
            'purchase_price' => 10,
            'sale_price' => 14,
            'category_id' => $category->id,
        ]);

        $purchase = Purchase::create([
            'number' => 5002,
            'supplier_name' => 'Test Supplier',
            'payment_type' => 'cash',
            'total_price' => 0,
            'user_id' => $user->id,
        ]);

        PurchaseItem::create([
            'purchase_id' => $purchase->id,
            'item_name' => $product->name,
            'quantity' => 5,
            'purchase_price' => 10,
        ]);

        $otherReturn = PurchaseReturn::create([
            'number' => 'PR-OTHER-1',
            'total_price' => 30,
            'note' => null,
            'is_refunded' => false,
            'user_id' => $user->id,
            'purchase_id' => $purchase->id,
        ]);

        $otherReturn->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'purchase_price' => 10,
            'quantity' => 3,
        ]);

        $purchaseReturn = PurchaseReturn::create([
            'number' => 'PR-UP-2',
            'total_price' => 10,
            'note' => null,
            'is_refunded' => false,
            'user_id' => $user->id,
            'purchase_id' => $purchase->id,
        ]);

        $purchaseReturn->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'purchase_price' => 10,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($user)
            ->withSession(['_token' => 'test-token'])
            ->from('/')
            ->put('/purchase-returns/'.$purchaseReturn->id, [
                '_token' => 'test-token',
                'purchase_id' => $purchase->id,
                'items' => [
                    ['product_id' => $product->id, 'quantity' => 3],
                ],
                'is_refunded' => false,
                'note' => 'Too much',
            ]);

        $response->assertRedirect('/');
        $response->assertSessionHasErrors('items');

        $this->assertDatabaseHas('purchase_return_items', [
            'purchase_return_id' => $purchaseReturn->id,
            'quantity' => 1,
        ]);
    }

    public function test_user_can_delete_purchase_return_invoice(): void
    {
        $user = User::factory()->create();
        Permission::findOrCreate('manage_purchases');
        $user->givePermissionTo('manage_purchases');

        $category = Category::create(['name' => 'General']);

        $product = Product::create([
            'name' => 'Product A',
            'code' => 'PA-001',
            'purchase_price' => 10,
            'sale_price' => 14,
            'category_id' => $category->id,
        ]);

        $purchase = Purchase::create([
            'number' => 5003,
            'supplier_name' => 'Test Supplier',
            'payment_type' => 'cash',
            'total_price' => 0,
            'user_id' => $user->id,
        ]);

        PurchaseItem::create([
            'purchase_id' => $purchase->id,
            'item_name' => $product->name,
            'quantity' => 4,
            'purchase_price' => 10,
        ]);

        $purchaseReturn = PurchaseReturn::create([
            'number' => 'PR-DEL-1',
            'total_price' => 20,
            'note' => null,
            'is_refunded' => false,
            'user_id' => $user->id,
            'purchase_id' => $purchase->id,
        ]);

        $purchaseReturn->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'purchase_price' => 10,
            'quantity' => 2,
        ]);

        $response = $this->actingAs($user)
            ->withSession(['_token' => 'test-token'])
            ->delete('/purchase-returns/'.$purchaseReturn->id, [
                '_token' => 'test-token',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseMissing('purchase_returns', [
            'id' => $purchaseReturn->id,
        ]);

        $this->assertDatabaseMissing('purchase_return_items', [
            'purchase_return_id' => $purchaseReturn->id,
        ]);
    }
}
