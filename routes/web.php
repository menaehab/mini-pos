<?php

use App\Http\Controllers\CustomerController;
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

    // customer management
    Route::resource('customers', CustomerController::class)->middleware([
        'index' => 'can:view_customers|manage_customers',
        'create' => 'can:manage_customers',
        'store' => 'can:manage_customers',
        'show' => 'can:view_customers|manage_customers',
        'edit' => 'can:manage_customers',
        'update' => 'can:manage_customers',
        'destroy' => 'can:manage_customers',
    ]);
});

require __DIR__.'/auth.php';
