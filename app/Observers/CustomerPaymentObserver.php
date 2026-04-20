<?php

namespace App\Observers;

use App\Models\CustomerPayment;

class CustomerPaymentObserver
{
    public function creating(CustomerPayment $customerPayment)
    {
        $customerPayment->user_id = auth()->id();
    }
}
