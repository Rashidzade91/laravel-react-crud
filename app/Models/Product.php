<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'price', 'count'];

    protected $appends = ['stock_status'];

    protected function price(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => number_format($value, 2) . ' AZN',
        );
    }

    protected function stockStatus(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->count > 0 ? 'Anbarda var' : 'Tukenib',
        );
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
