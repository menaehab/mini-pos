<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'amount',
    'note',
    'supplier_id',
])]
class SupplierPayment extends Model
{
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function supplierPaymentAllocations()
    {
        return $this->hasMany(SupplierPaymentAllocation::class);
    }
}
