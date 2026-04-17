<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    // user management
    Route::resource('users', UserController::class)->except(['show']);
});

require __DIR__.'/auth.php';
