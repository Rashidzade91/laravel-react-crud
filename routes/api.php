<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/products/search', [ProductController::class, 'search']);

// Bütün CRUD əməliyyatlarını tək sətirlə yaradırıq
// Route::apiResource('products', ProductController::class);

// 1. Bütün məhsulları gətirmək (Read - All)
// Brauzer və ya React-dən GET http://localhost:8000/api/products yazanda işləyir
Route::get('/products', [ProductController::class, 'index']);

// 3. Tək bir məhsulun məlumatına baxmaq (Read - Single)
// Məsələn: /api/products/5 (ID-si 5 olan məhsulu gətirir)
Route::get('/products/{product}', [ProductController::class, 'show']);



// 2. Yeni məhsul yaratmaq (Create)
// React-dən POST http://localhost:8000/api/products yazanda işləyir
Route::middleware(['auth:sanctum', 'admin'])->post('/products', [ProductController::class, 'store']);

// 4. Mövcud məhsulu yeniləmək (Update)
// PUT və ya PATCH metodu ilə işləyir
Route::middleware(['auth:sanctum', 'admin'])->put('/products/{product}', [ProductController::class, 'update']);

// 5. Məhsulu silmək (Delete)
// DELETE metodu ilə işləyir
Route::middleware(['auth:sanctum', 'admin'])->delete('/products/{product}', [ProductController::class, 'destroy']);

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/admin/login', [AuthController::class, 'adminLogin']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::put('/orders/{id}', [OrderController::class, 'update']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    //Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
});

Route::middleware(['auth:sanctum', 'admin'])->patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
