<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\SupplierPaymentController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->name('dashboard.')->group(function () {

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
        ->except(['index'])
        ->middleware('permission:manage_suppliers');

    Route::get('suppliers/{supplier}', [SupplierController::class, 'show'])
        ->name('suppliers.show')
        ->middleware('permission:view_suppliers');

    // customers
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

    // supplier payments
    Route::get('supplier-payments', [SupplierPaymentController::class, 'index'])
        ->name('supplier_payments.index')
        ->middleware('permission:view_supplier_payments|manage_supplier_payments');
    Route::post('supplier-payments', [SupplierPaymentController::class, 'store'])
        ->name('supplier_payments.store')
        ->middleware('permission:create_supplier_payments|manage_supplier_payments');
    Route::put('supplier-payments/{supplierPayment}', [SupplierPaymentController::class, 'update'])
        ->name('supplier_payments.update')
        ->middleware('permission:update_supplier_payments|manage_supplier_payments');
    Route::delete('supplier-payments/{supplierPayment}', [SupplierPaymentController::class, 'destroy'])
        ->name('supplier_payments.destroy')
        ->middleware('permission:manage_supplier_payments');

});
require __DIR__.'/auth.php';
