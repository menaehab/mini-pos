<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'number',
    'total_price',
    'supplier_name',
    'payment_type',
    'user_id',
    'supplier_id',
])]
class Purchase extends Model
{
    public function items()
    {
        return $this->hasMany(PurchaseItem::class);
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
}
