<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'phone', 'address', 'national_number'])]
class Customer extends Model
{
    protected $appends = ['balance'];

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    public function payments()
    {
        return $this->hasMany(CustomerPayment::class);
    }

    /**
     * Calculate the balance owed by this customer.
     * Balance = Total Sales - Total Payments - Non-Refunded Returns
     */
    protected function balance(): Attribute
    {
        return Attribute::make(
            get: function () {
                $totalSales = $this->sales()->sum('total_price');

                $totalPayments = $this->payments()->sum('amount');

                $totalNonRefundedReturns = $this->sales()
                    ->with('returns')
                    ->get()
                    ->flatMap(fn ($sale) => $sale->returns)
                    ->where('is_refunded', false)
                    ->sum('total_price');

                return $totalSales - $totalPayments - $totalNonRefundedReturns;
            }
        );
    }
}
