<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'phone'])]
class Supplier extends Model
{
    protected $appends = ['balance'];

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }

    public function payments()
    {
        return $this->hasMany(SupplierPayment::class);
    }

    /**
     * Calculate the balance owed to this supplier.
     * Balance = Total Purchases - Total Payments - Non-Refunded Returns
     */
    protected function balance(): Attribute
    {
        return Attribute::make(
            get: function () {
                $totalPurchases = $this->purchases()->sum('total_price');

                $totalPayments = $this->payments()->sum('amount');

                $totalNonRefundedReturns = $this->purchases()
                    ->with('returns')
                    ->get()
                    ->flatMap(fn ($purchase) => $purchase->returns)
                    ->where('is_refunded', false)
                    ->sum('total_price');

                return $totalPurchases - $totalPayments - $totalNonRefundedReturns;
            }
        );
    }
}
