<?php

namespace Tests\Unit;

use App\Models\Purchase;
use App\Models\Sale;
use App\Models\Supplier;
use App\Models\User;
use App\Services\AnalyticsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_charts_include_performance_last_7_days_with_sales_and_purchases(): void
    {
        $user = User::factory()->create();
        $supplier = Supplier::create(['name' => 'Test Supplier', 'phone' => null]);

        $sale = Sale::withoutEvents(function () use ($user) {
            $sale = new Sale([
                'total_price' => 150,
                'note' => null,
                'type' => 'cash',
                'customer_name' => 'Cash Customer',
                'installment_months' => null,
                'installment_amount' => null,
                'installment_rate' => null,
                'customer_id' => null,
                'user_id' => $user->id,
            ]);

            $sale->forceFill(['number' => 'S-CHART-001']);
            $sale->save();

            return $sale;
        });

        $sale->forceFill([
            'created_at' => now()->subDays(1),
            'updated_at' => now()->subDays(1),
        ])->save();

        $purchase = Purchase::withoutEvents(function () use ($user, $supplier) {
            $purchase = new Purchase([
                'number' => 'P-CHART-001',
                'total_price' => 90,
                'supplier_name' => $supplier->name,
                'payment_type' => 'cash',
                'note' => null,
                'user_id' => $user->id,
                'supplier_id' => $supplier->id,
            ]);

            $purchase->save();

            return $purchase;
        });

        $purchase->forceFill([
            'created_at' => now()->subDays(1),
            'updated_at' => now()->subDays(1),
        ])->save();

        $data = app(AnalyticsService::class)->getDashboardData('week');

        $this->assertArrayHasKey('charts', $data);
        $this->assertArrayHasKey('performance_last_7_days', $data['charts']);
        $this->assertCount(7, $data['charts']['performance_last_7_days']);

        $sample = $data['charts']['performance_last_7_days'][0];

        $this->assertArrayHasKey('date', $sample);
        $this->assertArrayHasKey('label', $sample);
        $this->assertArrayHasKey('sales', $sample);
        $this->assertArrayHasKey('purchases', $sample);

        $this->assertSame(
            150.0,
            round(collect($data['charts']['performance_last_7_days'])->sum('sales'), 2)
        );

        $this->assertSame(
            90.0,
            round(collect($data['charts']['performance_last_7_days'])->sum('purchases'), 2)
        );
    }
}
