<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerPaymentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\PurchaseReturnController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SaleReturnController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\SupplierPaymentController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {

    Route::get('/', [HomeController::class, 'index'])->name('home');

    // users
    Route::get('users', [UserController::class, 'index'])
        ->name('users.index')
        ->middleware('permission:view_users|manage_users');

    Route::resource('users', UserController::class)
        ->except(['index', 'show'])
        ->middleware('permission:manage_users');

    // suppliers
    Route::get('suppliers', [SupplierController::class, 'index'])
        ->name('suppliers.index')
        ->middleware('permission:view_suppliers|manage_suppliers');

    Route::resource('suppliers', SupplierController::class)
        ->except(['index', 'show'])
        ->middleware('permission:manage_suppliers');

    Route::get('suppliers/{supplier}', [SupplierController::class, 'show'])
        ->name('suppliers.show')
        ->middleware('permission:view_suppliers');

    // customers
    Route::get('customers/search', [CustomerController::class, 'search'])
        ->name('customers.search');

    Route::get('customers', [CustomerController::class, 'index'])
        ->name('customers.index')
        ->middleware('permission:view_customers|manage_customers');

    Route::resource('customers', CustomerController::class)
        ->except(['index', 'show'])
        ->middleware('permission:manage_customers');

    Route::get('customers/{customer}', [CustomerController::class, 'show'])
        ->name('customers.show')
        ->middleware('permission:view_customers|manage_customers');

    // categories
    Route::get('categories/search', [CategoryController::class, 'searchCategories'])
        ->name('categories.search');

    Route::get('categories', [CategoryController::class, 'index'])
        ->name('categories.index')
        ->middleware('permission:view_categories|manage_categories');

    Route::resource('categories', CategoryController::class)
        ->except(['index', 'show'])
        ->middleware('permission:manage_categories');

    Route::get('categories/{category}', [CategoryController::class, 'show'])
        ->name('categories.show')
        ->middleware('permission:view_categories|manage_categories');

    // products
    Route::get('products/search', [ProductController::class, 'searchProducts'])
        ->name('products.search');
    Route::get('products', [ProductController::class, 'index'])
        ->name('products.index')
        ->middleware('permission:view_products|manage_products');

    Route::resource('products', ProductController::class)
        ->except(['index', 'show'])
        ->middleware('permission:manage_products');

    Route::get('products/{product}', [ProductController::class, 'show'])
        ->name('products.show')
        ->middleware('permission:view_products|manage_products');

    // purchases
    Route::get('purchases/get-purchase/{number}', [PurchaseController::class, 'getPurchase'])
        ->name('purchases.get-purchase')
        ->middleware('permission:view_purchases|manage_purchases');

    Route::get('purchases', [PurchaseController::class, 'index'])
        ->name('purchases.index')
        ->middleware('permission:view_purchases|manage_purchases');

    Route::get('purchases/create', [PurchaseController::class, 'create'])
        ->name('purchases.create')
        ->middleware('permission:add_purchases|manage_purchases');

    Route::post('purchases', [PurchaseController::class, 'store'])
        ->name('purchases.store')
        ->middleware('permission:add_purchases|manage_purchases');

    Route::get('purchases/{purchase}', [PurchaseController::class, 'show'])
        ->name('purchases.show')
        ->middleware('permission:view_purchases|manage_purchases');

    Route::get('purchases/{purchase}/edit', [PurchaseController::class, 'edit'])
        ->name('purchases.edit')
        ->middleware('permission:edit_purchases|manage_purchases');

    Route::put('purchases/{purchase}', [PurchaseController::class, 'update'])
        ->name('purchases.update')
        ->middleware('permission:edit_purchases|manage_purchases');

    Route::delete('purchases/{purchase}', [PurchaseController::class, 'destroy'])
        ->name('purchases.destroy')
        ->middleware('permission:manage_purchases');

    // purchase returns
    Route::get('purchase-returns', [PurchaseReturnController::class, 'index'])
        ->name('purchase-returns.index')
        ->middleware('permission:view_purchase_returns|manage_purchase_returns');

    Route::get('purchase-returns/create', [PurchaseReturnController::class, 'create'])
        ->name('purchase-returns.create')
        ->middleware('permission:add_purchase_returns|manage_purchase_returns');

    Route::post('purchase-returns', [PurchaseReturnController::class, 'store'])
        ->name('purchase-returns.store')
        ->middleware('permission:add_purchase_returns|manage_purchase_returns');

    Route::get('purchase-returns/{purchaseReturn}', [PurchaseReturnController::class, 'show'])
        ->name('purchase-returns.show')
        ->middleware('permission:view_purchase_returns|manage_purchase_returns');

    Route::get('purchase-returns/{purchaseReturn}/edit', [PurchaseReturnController::class, 'edit'])
        ->name('purchase-returns.edit')
        ->middleware('permission:edit_purchase_returns|manage_purchase_returns');

    Route::put('purchase-returns/{purchaseReturn}', [PurchaseReturnController::class, 'update'])
        ->name('purchase-returns.update')
        ->middleware('permission:edit_purchase_returns|manage_purchase_returns');

    Route::delete('purchase-returns/{purchaseReturn}', [PurchaseReturnController::class, 'destroy'])
        ->name('purchase-returns.destroy')
        ->middleware('permission:manage_purchase_returns');

    // sales
    Route::get('sales/get-sale/{id}', [SaleController::class, 'getSale'])
        ->name('sales.get-sale')
        ->middleware('permission:view_sales|manage_sales');

    Route::get('sales', [SaleController::class, 'index'])
        ->name('sales.index')
        ->middleware('permission:view_sales|manage_sales');

    Route::post('sales', [SaleController::class, 'store'])
        ->name('sales.store')
        ->middleware('permission:add_sales|manage_sales');

    Route::get('sales/{sale}', [SaleController::class, 'show'])
        ->name('sales.show')
        ->middleware('permission:view_sales|manage_sales');

    Route::get('sales/{sale}/edit', [SaleController::class, 'edit'])
        ->name('sales.edit')
        ->middleware('permission:edit_sales|manage_sales');

    Route::put('sales/{sale}', [SaleController::class, 'update'])
        ->name('sales.update')
        ->middleware('permission:edit_sales|manage_sales');

    Route::delete('sales/{sale}', [SaleController::class, 'destroy'])
        ->name('sales.destroy')
        ->middleware('permission:manage_sales');

    // sale returns
    Route::get('sale-returns', [SaleReturnController::class, 'index'])
        ->name('sale-returns.index')
        ->middleware('permission:view_sale_returns|manage_sale_returns');

    Route::get('sale-returns/create', [SaleReturnController::class, 'create'])
        ->name('sale-returns.create')
        ->middleware('permission:add_sale_returns|manage_sale_returns');

    Route::post('sale-returns', [SaleReturnController::class, 'store'])
        ->name('sale-returns.store')
        ->middleware('permission:add_sale_returns|manage_sale_returns');

    Route::get('sale-returns/{saleReturn}', [SaleReturnController::class, 'show'])
        ->name('sale-returns.show')
        ->middleware('permission:view_sale_returns|manage_sale_returns');

    Route::get('sale-returns/{saleReturn}/edit', [SaleReturnController::class, 'edit'])
        ->name('sale-returns.edit')
        ->middleware('permission:edit_sale_returns|manage_sale_returns');

    Route::put('sale-returns/{saleReturn}', [SaleReturnController::class, 'update'])
        ->name('sale-returns.update')
        ->middleware('permission:edit_sale_returns|manage_sale_returns');

    Route::delete('sale-returns/{saleReturn}', [SaleReturnController::class, 'destroy'])
        ->name('sale-returns.destroy')
        ->middleware('permission:manage_sale_returns');

    // supplier payments
    Route::get('supplier-payments', [SupplierPaymentController::class, 'index'])
        ->name('supplier-payments.index')
        ->middleware('permission:view_supplier_payments|manage_supplier_payments');

    Route::post('supplier-payments', [SupplierPaymentController::class, 'store'])
        ->name('supplier-payments.store')
        ->middleware('permission:add_supplier_payments|manage_supplier_payments');

    Route::put('supplier-payments/{supplierPayment}', [SupplierPaymentController::class, 'update'])
        ->name('supplier-payments.update')
        ->middleware('permission:edit_supplier_payments|manage_supplier_payments');

    Route::delete('supplier-payments/{supplierPayment}', [SupplierPaymentController::class, 'destroy'])
        ->name('supplier-payments.destroy')
        ->middleware('permission:manage_supplier_payments');

    // customer payments
    Route::get('customer-payments', [CustomerPaymentController::class, 'index'])
        ->name('customer-payments.index')
        ->middleware('permission:view_customer_payments|manage_customer_payments');

    Route::post('customer-payments', [CustomerPaymentController::class, 'store'])
        ->name('customer-payments.store')
        ->middleware('permission:add_customer_payments|manage_customer_payments');

    Route::put('customer-payments/{customerPayment}', [CustomerPaymentController::class, 'update'])
        ->name('customer-payments.update')
        ->middleware('permission:edit_customer_payments|manage_customer_payments');

    Route::delete('customer-payments/{customerPayment}', [CustomerPaymentController::class, 'destroy'])
        ->name('customer-payments.destroy')
        ->middleware('permission:manage_customer_payments');

    Route::get('dashboard', [DashboardController::class, 'index'])
        ->name('dashboard')
        ->middleware('permission:view_dashboard');

});

require __DIR__.'/auth.php';
