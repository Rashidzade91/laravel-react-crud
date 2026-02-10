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
     * Mutator: AdÄ± bazaya yazÄ±larkÉ™n formatlayÄ±r.
     * React-dÉ™n "alma" gÉ™lsÉ™, bazaya "Alma" kimi dÃ¼ÅŸÉ™cÉ™k.
     */
    // set:: Bu hissÉ™ "bazaya bir ÅŸey yazÄ±larkÉ™n bu funksiyanÄ± iÅŸlÉ™t" demÉ™kdir
    // strtolower($value): Ä°stifadÉ™Ã§i adÄ± necÉ™ yazÄ±rsa yazsÄ±n (mÉ™sÉ™lÉ™n: "aLMa", "ALMA"), Laravel É™vvÉ™lcÉ™ bÃ¼tÃ¼n hÉ™rflÉ™ri kiÃ§ildir ("alma").
    // ucfirst(...): Sonra hÉ™min sÃ¶zÃ¼n yalnÄ±z birinci hÉ™rfini bÃ¶yÃ¼dÃ¼r ("Alma").
    protected function name(): Attribute
    {
        return Attribute::make(
            set: fn (string $value) => ucfirst(strtolower($value)),
        );
    }

    // number_format($value, 2): Bazada qiymÉ™t sadÉ™cÉ™ rÉ™qÉ™mdir (mÉ™sÉ™lÉ™n: 1250.5). Bu funksiya onu formatlayÄ±r: vergÃ¼ldÉ™n sonra mÃ¼tlÉ™q 2 rÉ™qÉ™m gÃ¶stÉ™rir (1250.50).
    // . ' AZN': QiymÉ™tin sonuna " AZN" sÃ¶zÃ¼nÃ¼ yapÄ±ÅŸdÄ±rÄ±r.

    // Accessor: AdÄ± bazadan oxunarkÉ™n formatlayÄ±r.
    protected function price(): Attribute
    {
        return Attribute::make(
            get: fn (string $value) => number_format($value, 2) . ' AZN',
        );
    }

    protected function stockStatus(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->count > 0 ? 'Anbarda var' : 'TÃ¼kÉ™nib',
        );
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
