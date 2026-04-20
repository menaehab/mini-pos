<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'purchase_id',
    'product_id',
    'item_name',
    'quantity',
    'purchase_price',
])]
class PurchaseItem extends Model
{
    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }
}
