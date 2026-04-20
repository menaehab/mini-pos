<?php

namespace App\Observers;

use App\Models\SaleReturn;

class SaleReturnObserver
{
    /**
     * Handle the SaleReturn "creating" event.
     */
    public function creating(SaleReturn $saleReturn): void
    {
        $today = now()->format('Ymd');

        $returnCount = SaleReturn::whereDate('created_at', today())
            ->lockForUpdate()
            ->count();

        $saleReturn->number = $today.'-'.str_pad($returnCount + 1, 6, '0', STR_PAD_LEFT);
    }

    /**
     * Handle the SaleReturn "updated" event.
     */
    public function updated(SaleReturn $saleReturn): void
    {
        //
    }

    /**
     * Handle the SaleReturn "deleted" event.
     */
    public function deleted(SaleReturn $saleReturn): void
    {
        //
    }

    /**
     * Handle the SaleReturn "restored" event.
     */
    public function restored(SaleReturn $saleReturn): void
    {
        //
    }

    /**
     * Handle the SaleReturn "force deleted" event.
     */
    public function forceDeleted(SaleReturn $saleReturn): void
    {
        //
    }
}
