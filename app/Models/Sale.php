<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
        'total_price',
        'note',
        'type',
        'customer_name',
        'installment_months',
        'installment_amount',
        'installment_rate',
        'customer_id',
        'user_id',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function paymentAllocations()
    {
        return $this->hasMany(CustomerPaymentAllocation::class);
    }

    public function returns()
    {
        return $this->hasMany(SaleReturn::class);
    }
}
