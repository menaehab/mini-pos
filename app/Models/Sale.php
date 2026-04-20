<?php

namespace App\Models;

use App\Enums\SaleTypeEnum;
use App\Observers\SaleObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[ObservedBy(SaleObserver::class)]
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

    /** @var array<int, string> */
    protected $appends = ['total', 'paid', 'remaining', 'status'];

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

    public function firstPayment(): HasOne
    {
        return $this->hasOne(CustomerPaymentAllocation::class)->where('is_first_payment', true);
    }

    /**
     * Reach CustomerPayment records linked to this sale via allocations.
     * Used with withSum() in the controller to avoid N+1 queries.
     */
    public function payments(): HasManyThrough
    {
        return $this->hasManyThrough(
            CustomerPayment::class,
            CustomerPaymentAllocation::class,
            'sale_id',              // FK on customer_payment_allocations
            'id',                   // FK on customer_payments
            'id',                   // local key on sales
            'customer_payment_id',  // local key on customer_payment_allocations
        );
    }

    /**
     * Total amount owed — includes installment interest for installment sales.
     *
     * Cash:        total = total_price
     * Installment: total = total_price + (total_price × installment_rate / 100)
     */
    protected function total(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->type === SaleTypeEnum::INSTALLMENT->value && $this->installment_rate > 0) {
                    return round($this->total_price + ($this->total_price * $this->installment_rate / 100), 2);
                }

                return (float) $this->total_price;
            }
        );
    }

    /**
     * Total amount paid so far.
     * Uses `paid_amount` appended by withSum() in the controller if available,
     * otherwise falls back to a direct query.
     */
    protected function paid(): Attribute
    {
        return Attribute::make(
            get: fn () => (float) ($this->paid_amount ?? $this->payments()->sum('amount'))
        );
    }

    /**
     * Remaining balance = total - paid (floored at 0).
     */
    protected function remaining(): Attribute
    {
        return Attribute::make(
            get: fn () => max(0, round($this->total - $this->paid, 2))
        );
    }

    /**
     * Payment status based on remaining balance.
     *
     * paid    → remaining = 0
     * partial → 0 < remaining < total
     * unpaid  → remaining = total (nothing paid)
     */
    protected function status(): Attribute
    {
        return Attribute::make(
            get: function () {
                $remaining = $this->remaining;
                $total = $this->total;

                if ($remaining <= 0) {
                    return 'paid';
                }

                if ($remaining >= $total) {
                    return 'unpaid';
                }

                return 'partial';
            }
        );
    }

    public function returns()
    {
        return $this->hasMany(SaleReturn::class);
    }
}
