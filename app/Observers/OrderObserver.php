<?php

namespace App\Observers;

use App\Models\Order;
use Illuminate\Support\Facades\Log;

class OrderObserver
{
    public function saving(Order $order): void
    {
        if ($order->status !== null) {
            $order->status = strtolower(trim($order->status));
        }

        if ($order->note !== null) {
            $order->note = trim($order->note);
        }
    }

    public function created(Order $order): void
    {
        Log::info('Order created', [
            'id' => $order->id,
            'user_id' => $order->user_id,
            'status' => $order->status,
        ]);
    }

    public function updated(Order $order): void
    {
        Log::info('Order updated', [
            'id' => $order->id,
            'changed' => array_keys($order->getChanges()),
        ]);
    }

    public function deleted(Order $order): void
    {
        Log::info('Order deleted', ['id' => $order->id]);
    }
}
