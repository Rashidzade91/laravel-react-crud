<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Models\Product;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // latest() Product::latest()->get() əlavə etsək, ən son əlavə olunan məhsul ən başda görünər.
        // Cavabı JSON formatında qaytarırıq. 
        // Status kodu yazmasaq, susmaya görə 200 (OK) sayılır.
        $products = Product::all();

        return response()->json(data: $products);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        // Addım 1: Validasiya (Yoxlama)
        // React-dən gələn məlumatların boş və ya səhv olub-olmadığını yoxlayırıq.
        $validated = $request->validated();


        // Addım 2: Bazaya Yazmaq
        // Əgər validasiyadan keçsə, bu kod işləyəcək
        $product = Product::create($validated);

        // Addım 3: React-ə uğurlu cavab qaytarmaq
        return response()->json([
            'success' => true,
            'message' => 'Mehsul bazaya elave edildi',
            'data' => $product,
        ], 201); // 201 status kodu 'created' demekdir.

    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $product = Product::findOrFail($id);

        return response()->json($product);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['message' => 'Mehsul tapilmadi'], 404);
        }

        // 2. Gələn məlumatları yoxlayırıq (Validation)
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'count' => ['required', 'integer', 'min:0'],
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Mehsul ugurla yenilendi',
            'product' => $product
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // 1. Məhsulu bazada axtarırıq
        $product = Product::findOrFail($id); // Əgər məhsul tapılmazsa, 404 səhifəsi qaytarır

        // 2. Əgər məhsul tapılmasa, xəta qaytarırıq
        if (!$product) {
            return response()->json([
                'message' => 'Mehsul tapilmadi',
            ], 404);
        }
        // 3. Məhsulu silirik
        $product->delete();

        // 4. Uğurlu cavab qaytarırıq
        return response()->json([
            'message' => 'Mehsul silindi',
        ], 200);
    }

    public function search(Request $request)
    {
        $query = $request->input('query');

        $products = Product::where('name', 'LIKE', "%{$query}%")
            ->orWhere('description', 'LIKE', "%{$query}%")
            ->get();

        return response()->json($products);
    }
}
