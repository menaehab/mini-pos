<?php

namespace App\Observers;

use App\Models\Purchase;

class PurchaseObserver
{
    /**
     * Handle the Purchase "creating" event.
     */
    public function creating(Purchase $purchase): void
    {
        $today = now()->format('Ymd');

        $purchaseCount = Purchase::whereDate('created_at', today())
            ->lockForUpdate()
            ->count();

        $purchase->number = $today.'-'.str_pad($purchaseCount + 1, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Handle the Purchase "updated" event.
     */
    public function updated(Purchase $purchase): void
    {
        //
    }

    /**
     * Handle the Purchase "deleted" event.
     */
    public function deleted(Purchase $purchase): void
    {
        //
    }

    /**
     * Handle the Purchase "restored" event.
     */
    public function restored(Purchase $purchase): void
    {
        //
    }

    /**
     * Handle the Purchase "force deleted" event.
     */
    public function forceDeleted(Purchase $purchase): void
    {
        //
    }
}
