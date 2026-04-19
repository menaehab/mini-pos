<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {

    Route::get('users', [UserController::class, 'index'])
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
        ->middleware('permission:view_categories|manage_categories');

    Route::resource('categories', CategoryController::class)
        ->except(['index', 'show'])
        ->middleware('permission:manage_categories');

    Route::get('categories/{category}', [CategoryController::class, 'show'])
        ->middleware('permission:view_categories|manage_categories');

    // products
    Route::get('products', [ProductController::class, 'index'])
        ->middleware('permission:view_products|manage_products');

    Route::resource('products', ProductController::class)
        ->except(['index', 'show'])
        ->middleware('permission:manage_products');

    Route::get('products/{product}', [ProductController::class, 'show'])
        ->middleware('permission:view_products|manage_products');

    Route::get('/', [HomeController::class, 'index'])->name('home');
});

require __DIR__.'/auth.php';
