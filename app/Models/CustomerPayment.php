<?php

namespace App\Models;

use App\Observers\CustomerPaymentObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy(CustomerPaymentObserver::class)]
class CustomerPayment extends Model
{
    protected $fillable = [
        'amount',
        'note',
        'customer_id',
        'user_id',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function allocations()
    {
        return $this->hasMany(CustomerPaymentAllocation::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
