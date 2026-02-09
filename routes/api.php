<?php

use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/products/search', [ProductController::class, 'search']);

// Bütün CRUD əməliyyatlarını tək sətirlə yaradırıq
// Route::apiResource('products', ProductController::class);

// 1. Bütün məhsulları gətirmək (Read - All)
// Brauzer və ya React-dən GET http://localhost:8000/api/products yazanda işləyir
Route::get('/products', [ProductController::class, 'index']);

// 2. Yeni məhsul yaratmaq (Create)
// React-dən POST http://localhost:8000/api/products yazanda işləyir
Route::post('/products', [ProductController::class, 'store']);

// 3. Tək bir məhsulun məlumatına baxmaq (Read - Single)
// Məsələn: /api/products/5 (ID-si 5 olan məhsulu gətirir)
Route::get('/products/{id}', [ProductController::class, 'show']);

// 4. Mövcud məhsulu yeniləmək (Update)
// PUT və ya PATCH metodu ilə işləyir
Route::put('/products/{id}', [ProductController::class, 'update']);

// 5. Məhsulu silmək (Delete)
// DELETE metodu ilə işləyir
Route::delete('/products/{id}', [ProductController::class, 'destroy']);