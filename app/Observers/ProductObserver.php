<?php

namespace App\Observers;

use App\Models\Product;
use Illuminate\Support\Facades\Log;

class ProductObserver
{
    public function saving(Product $product): void
    {
        if ($product->name !== null) {
            $product->name = ucfirst(strtolower(trim($product->name)));
        }

        if ($product->description !== null) {
            $product->description = trim($product->description);
        }
    }

    public function created(Product $product): void
    {
        Log::info('Product created', ['id' => $product->id, 'name' => $product->name]);
    }

    public function updated(Product $product): void
    {
        Log::info('Product updated', [
            'id' => $product->id,
            'changed' => array_keys($product->getChanges()),
        ]);
    }

    public function deleted(Product $product): void
    {
        Log::info('Product deleted', ['id' => $product->id]);
    }
}
