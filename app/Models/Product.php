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

    /**
     * Mutator: Adı bazaya yazılarkən formatlayır.
     * React-dən "alma" gəlsə, bazaya "Alma" kimi düşəcək.
     */
    // set:: Bu hissə "bazaya bir şey yazılarkən bu funksiyanı işlət" deməkdir
    // strtolower($value): İstifadəçi adı necə yazırsa yazsın (məsələn: "aLMa", "ALMA"), Laravel əvvəlcə bütün hərfləri kiçildir ("alma").
    // ucfirst(...): Sonra həmin sözün yalnız birinci hərfini böyüdür ("Alma").
     
    protected function name(): Attribute 
    {
        return Attribute::make(
            set: fn (string $value) => ucfirst(strtolower($value)),
        );
    }

    // number_format($value, 2): Bazada qiymət sadəcə rəqəmdir (məsələn: 1250.5). Bu funksiya onu formatlayır: vergüldən sonra mütləq 2 rəqəm göstərir (1250.50).
    // . ' AZN': Qiymətin sonuna " AZN" sözünü yapışdırır.


    // Accessor: Adı bazadan oxunarkən formatlayır.
    protected function price(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => number_format($value, 2) . ' AZN',
        );
    }

    protected function stockStatus(): Attribute
{
    return Attribute::make(
        get: fn () => $this->count > 0 ? 'Anbarda var' : 'Tükənib',
    );
}
}
