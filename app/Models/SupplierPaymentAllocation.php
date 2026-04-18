<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'supplier_payment_id',
    'purchase_id',
])]
class SupplierPaymentAllocation extends Model
{
    public function supplierPayment()
    {
        return $this->belongsTo(SupplierPayment::class);
    }

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }
}
