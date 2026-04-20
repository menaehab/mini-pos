<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Sale;
use App\Models\SaleItem;
use Carbon\CarbonImmutable;

class AnalyticsService
{
    // ─── Entry Point

    public function getDashboardData(string $period = 'today', int $lowStockThreshold = 5): array
    {
        $period = $this->validatePeriod($period);
        [$start, $end] = $this->getPeriodDates($period);

        return [
            'filters' => ['period' => $period, 'low_stock_threshold' => $lowStockThreshold],
            'salesOverview' => $this->getSalesOverview($start, $end),
            'profitAndCost' => $this->getProfitAndCost($start, $end),
            'products' => $this->getProductsData($start, $end, $lowStockThreshold),
            'customers' => $this->getCustomersData($start, $end),
            'purchases' => $this->getPurchasesData($start, $end),
            'charts' => $this->getChartsData($start, $end),
        ];
    }

    // ─── Sales Overview

    private function getSalesOverview(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $salesInPeriod = Sale::whereBetween('created_at', [$start, $end]);

        return [
            'today_total' => $this->sumSales(today()->startOfDay(), today()->endOfDay()),
            'week_total' => $this->sumSales(now()->startOfWeek(), now()->endOfWeek()),
            'month_total' => $this->sumSales(now()->startOfMonth(), now()->endOfMonth()),
            'invoices_count' => (clone $salesInPeriod)->count(),
            'average_order_value' => (float) (clone $salesInPeriod)->avg('total_price'),
        ];
    }

    private function sumSales($start, $end): float
    {
        return (float) Sale::whereBetween('created_at', [$start, $end])->sum('total_price');
    }

    // ─── Profit & Cost

    private function getProfitAndCost(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $revenue = (float) Sale::whereBetween('created_at', [$start, $end])
            ->sum('total_price');

        $cost = (float) SaleItem::whereHas('sale', fn ($q) => $q->whereBetween('created_at', [$start, $end]))
            ->selectRaw('SUM(purchase_price * quantity) AS total_cost')
            ->value('total_cost');

        return [
            'total_revenue' => $revenue,
            'total_cost' => $cost ?? 0,
            'net_profit' => $revenue - ($cost ?? 0),
        ];
    }

    // ─── Products

    private function getProductsData(CarbonImmutable $start, CarbonImmutable $end, int $threshold): array
    {
        return [
            'top_selling' => $this->getTopSellingProducts($start, $end),
            'low_stock' => $this->getLowStockProducts($threshold),
            'total_count' => Product::count(),
        ];
    }

    private function getTopSellingProducts(CarbonImmutable $start, CarbonImmutable $end)
    {
        return SaleItem::whereHas('sale', fn ($q) => $q->whereBetween('created_at', [$start, $end]))
            ->selectRaw('product_id, product_name, SUM(quantity) AS quantity_sold')
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('quantity_sold')
            ->limit(5)
            ->get();
    }

    private function getLowStockProducts(int $threshold)
    {
        return Product::query()
            ->withSum('purchaseItems as purchased_qty', 'quantity')
            ->withSum('saleItems as sold_qty', 'quantity')
            ->withSum('purchaseReturnItems as purchase_returned_qty', 'quantity')
            ->withSum('saleReturnItems as sale_returned_qty', 'quantity')
            ->get()
            ->map(function (Product $product) {
                $product->current_stock =
                    ($product->purchased_qty ?? 0)
                    + ($product->sale_returned_qty ?? 0)
                    - ($product->sold_qty ?? 0)
                    - ($product->purchase_returned_qty ?? 0);

                return $product;
            })
            ->filter(fn (Product $p) => $p->current_stock <= $threshold)
            ->sortBy('current_stock')
            ->take(10)
            ->values();
    }

    // ─── Customers

    private function getCustomersData(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $topCustomers = Customer::whereHas('sales', fn ($q) => $q->whereBetween('created_at', [$start, $end]))
            ->withSum(['sales as total_purchases' => fn ($q) => $q->whereBetween('created_at', [$start, $end])], 'total_price')
            ->orderByDesc('total_purchases')
            ->limit(5)
            ->get(['id', 'name']);

        return [
            'total_count' => Customer::count(),
            'top_customers' => $topCustomers,
        ];
    }

    // ─── Purchases

    private function getPurchasesData(CarbonImmutable $start, CarbonImmutable $end): array
    {
        $purchases = Purchase::whereBetween('created_at', [$start, $end])
            ->with('supplierPaymentAllocations.supplierPayment') // تحميل المدفوعات مرة واحدة
            ->get();

        $totalPurchases = $purchases->sum('total_price');

        $totalPaid = $purchases->sum(function (Purchase $purchase) {
            $paid = $purchase->supplierPaymentAllocations
                ->sum(fn ($allocation) => $allocation->supplierPayment->amount ?? 0);

            return min($paid, $purchase->total_price); // مش ممكن المدفوع يعدي الفاتورة
        });

        return [
            'total_purchases' => (float) $totalPurchases,
            'total_paid' => (float) $totalPaid,
            'total_unpaid' => (float) ($totalPurchases - $totalPaid),
        ];
    }

    // ─── Charts

    private function getChartsData(CarbonImmutable $start, CarbonImmutable $end): array
    {
        return [
            'sales_last_7_days' => $this->getLast7DaysSales(),
            'top_products' => $this->getTopSellingProducts($start, $end),
        ];
    }

    private function getLast7DaysSales(): array
    {
        $start = CarbonImmutable::today()->subDays(6)->startOfDay();
        $end = CarbonImmutable::today()->endOfDay();

        $salesByDate = Sale::whereBetween('created_at', [$start, $end])
            ->selectRaw('DATE(created_at) AS sale_date, SUM(total_price) AS total')
            ->groupBy('sale_date')
            ->pluck('total', 'sale_date');

        return collect(range(0, 6))->map(function (int $i) use ($start, $salesByDate) {
            $date = $start->addDays($i);

            return [
                'date' => $date->toDateString(),
                'label' => $date->isoFormat('ddd'),
                'total' => (float) ($salesByDate[$date->toDateString()] ?? 0),
            ];
        })->all();
    }

    // ─── Helpers

    private function validatePeriod(string $period): string
    {
        return in_array($period, ['today', 'week', 'month'], true) ? $period : 'today';
    }

    private function getPeriodDates(string $period): array
    {
        $now = CarbonImmutable::now();

        return match ($period) {
            'week' => [$now->startOfWeek()->startOfDay(),  $now->endOfWeek()->endOfDay()],
            'month' => [$now->startOfMonth()->startOfDay(), $now->endOfMonth()->endOfDay()],
            default => [$now->startOfDay(),                 $now->endOfDay()],
        };
    }
}
