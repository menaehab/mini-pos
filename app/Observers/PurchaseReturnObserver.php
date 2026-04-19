<?php

namespace App\Observers;

use App\Models\PurchaseReturn;

class PurchaseReturnObserver
{
    /**
     * Handle the PurchaseReturn "creating" event.
     */
    public function creating(PurchaseReturn $purchaseReturn): void
    {
        $today = now()->format('Ymd');

        $returnCount = PurchaseReturn::whereDate('created_at', today())
            ->lockForUpdate()
            ->count();

        $purchaseReturn->number = $today.'-'.str_pad($returnCount + 1, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Handle the PurchaseReturn "updated" event.
     */
    public function updated(PurchaseReturn $purchaseReturn): void
    {
        //
    }

    /**
     * Handle the PurchaseReturn "deleted" event.
     */
    public function deleted(PurchaseReturn $purchaseReturn): void
    {
        //
    }

    /**
     * Handle the PurchaseReturn "restored" event.
     */
    public function restored(PurchaseReturn $purchaseReturn): void
    {
        //
    }

    /**
     * Handle the PurchaseReturn "force deleted" event.
     */
    public function forceDeleted(PurchaseReturn $purchaseReturn): void
    {
        //
    }
}
