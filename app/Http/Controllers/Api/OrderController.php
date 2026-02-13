<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Order::with(['items.product', 'user'])->latest();

        if (!$user->is_admin) {
            $query->where('user_id', $user->id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'note' => ['nullable', 'string'],
        ]);

        $user = $request->user();


        // transaction: Databazada natamam/yarımçıq məlumat qalmasın.
        // order yaradılır
        //order item-lər yaradılır
        //total yenilənir
        //Əgər 2-ci addımda xəta olsa, 1-ci addım da geri qaytarılır.
        $order = DB::transaction(function () use ($validated, $user) {
            $order = Order::create([
                'user_id' => $user->id,
                'status' => 'pending',
                'total' => 0,
                'note' => $validated['note'] ?? null,
            ]);

            $total = 0;


            // lock olmasa ikisi də “stok var” görüb səhv satış ola bilər.
            // lock ilə biri işləyənə qədər o biri gözləyir, stok düzgün qalır.

            foreach ($validated['items'] as $item) {
                $product = Product::lockForUpdate()->find($item['product_id']);

                if (!$product) {
                    abort(422, 'Mehsul tapilmadi.');
                }

                if ($product->count < $item['quantity']) {
                    abort(422, 'Anbarda kifayet qeder mehsul yoxdur.');
                }

                $price = (float) $product->getRawOriginal('price');
                $lineTotal = $price * $item['quantity'];
                $total += $lineTotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $price,
                ]);

                $product->decrement('count', $item['quantity']);
            }

            $order->update(['total' => $total]);

            return $order->load(['items.product', 'user']);
        });

        return response()->json($order, 201);
    }

    public function show(Request $request, int $id)
    {
        $order = Order::with(['items.product', 'user'])->findOrFail($id);

        if (!$request->user()->is_admin && $order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Icaze yoxdur.'], 403);
        }

        return response()->json($order);
    }


    // Bu funksiya yalnız Adminlər üçündür.
    public function updateStatus(Request $request, int $id)
    {
        //dd(Auth::guard('api')->user());

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,approved,rejected,shipped,completed,canceled'],
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $validated['status']]);

        return response()->json($order);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'note' => ['nullable', 'string'],
        ]);

        $order = Order::with('items')->findOrFail($id);
        $user = $request->user();

        if (!$user->is_admin && $order->user_id !== $user->id) {
            return response()->json(['message' => 'Icaze yoxdur.'], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Sifaris artiq kilidlenib.'], 422);
        }

        $updatedOrder = DB::transaction(function () use ($order, $validated) {
            // restock old items
            foreach ($order->items as $oldItem) {
                $product = Product::lockForUpdate()->find($oldItem->product_id);
                if ($product) {
                    $product->increment('count', $oldItem->quantity);
                }
            }

            // delete old items
            OrderItem::where('order_id', $order->id)->delete();

            $total = 0;
            foreach ($validated['items'] as $item) {
                $product = Product::lockForUpdate()->find($item['product_id']);
                if (!$product) {
                    abort(422, 'Mehsul tapilmadi.');
                }
                if ($product->count < $item['quantity']) {
                    abort(422, 'Anbarda kifayet qeder mehsul yoxdur.');
                }

                $price = (float) $product->getRawOriginal('price');
                $total += $price * $item['quantity'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $price,
                ]);

                $product->decrement('count', $item['quantity']);
            }

            $order->update([
                'total' => $total,
                'note' => $validated['note'] ?? null,
            ]);

            return $order->load(['items.product', 'user']);
        });

        return response()->json($updatedOrder);
    }

    public function cancel(Request $request, int $id)
    {
        $order = Order::with('items')->findOrFail($id);
        $user = $request->user();

        if (!$user->is_admin && $order->user_id !== $user->id) {
            return response()->json(['message' => 'Icaze yoxdur.'], 403);
        }

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Sifaris artiq kilidlenib.'], 422);
        }

        DB::transaction(function () use ($order) {
            foreach ($order->items as $oldItem) {
                $product = Product::lockForUpdate()->find($oldItem->product_id);
                if ($product) {
                    $product->increment('count', $oldItem->quantity);
                }
            }
            $order->update(['status' => 'canceled']);
        });

        return response()->json($order->fresh(['items.product', 'user']));
    }
}
