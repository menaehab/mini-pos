<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    // user management
    Route::resource('users', UserController::class)->except(['show'])->middleware([
        'index' => 'can:view_users|manage_users',
        'create' => 'can:manage_users',
        'store' => 'can:manage_users',
        'edit' => 'can:manage_users',
        'update' => 'can:manage_users',
        'destroy' => 'can:manage_users',
    ]);

    // supplier management
    Route::resource('suppliers', SupplierController::class)->middleware([
        'index' => 'can:view_suppliers|manage_suppliers',
        'create' => 'can:manage_suppliers',
        'store' => 'can:manage_suppliers',
        'show' => 'can:view_suppliers',
        'edit' => 'can:manage_suppliers',
        'update' => 'can:manage_suppliers',
        'destroy' => 'can:manage_suppliers',
    ]);

    // customers management
    Route::resource('customers', CustomerController::class)->middleware([
        'index' => 'can:view_customers|manage_customers',
        'create' => 'can:manage_customers',
        'store' => 'can:manage_customers',
        'show' => 'can:view_customers|manage_customers',
        'edit' => 'can:manage_customers',
        'update' => 'can:manage_customers',
        'destroy' => 'can:manage_customers',
    ]);

    // categories management
    Route::resource('categories', CategoryController::class)->middleware([
        'index' => 'can:view_categories|manage_categories',
        'create' => 'can:manage_categories',
        'store' => 'can:manage_categories',
        'show' => 'can:view_categories|manage_categories',
        'edit' => 'can:manage_categories',
        'update' => 'can:manage_categories',
        'destroy' => 'can:manage_categories',
    ]);

    // products management
    Route::resource('products', ProductController::class)->middleware([
        'index' => 'can:view_products|manage_products',
        'create' => 'can:manage_products',
        'store' => 'can:manage_products',
        'show' => 'can:view_products|manage_products',
        'edit' => 'can:manage_products',
        'update' => 'can:manage_products',
        'destroy' => 'can:manage_products',
    ]);
});

Route::get('/', function () {
    return inertia('index');
})->name('home');

require __DIR__.'/auth.php';
