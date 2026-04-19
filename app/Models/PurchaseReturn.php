<?php

namespace App\Models;

use App\Observers\PurchaseReturnObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy(PurchaseReturnObserver::class)]
class PurchaseReturn extends Model
{
    protected $fillable = [
        'number',
        'total_price',
        'note',
        'is_refunded',
        'user_id',
        'purchase_id',
    ];

    public function items()
    {
        return $this->hasMany(PurchaseReturnItem::class);
    }

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
