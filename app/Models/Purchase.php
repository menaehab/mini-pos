<?php

namespace App\Models;

use App\Observers\PurchaseObserver;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'number',
    'total_price',
    'supplier_name',
    'payment_type',
    'note',
    'user_id',
    'supplier_id',
])]
#[ObservedBy(PurchaseObserver::class)]
class Purchase extends Model
{
    public function items()
    {
        return $this->hasMany(PurchaseItem::class);
    }

    public function returns()
    {
        return $this->hasMany(PurchaseReturn::class);
    }

    public function supplierPaymentAllocations()
    {
        return $this->hasMany(SupplierPaymentAllocation::class);
    }

    public function supplierPayments()
    {
        return $this->hasManyThrough(SupplierPayment::class, SupplierPaymentAllocation::class, 'purchase_id', 'id', 'id', 'supplier_payment_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function firstPayment()
    {
        return $this->hasOne(SupplierPaymentAllocation::class)->where('is_first_payment', true);
    }
}
