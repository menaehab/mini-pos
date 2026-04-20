<?php

namespace App\Http\Controllers;

use App\Http\Requests\Dashboard\DashboardRequest;
use App\Services\AnalyticsService;

class DashboardController extends Controller
{
    public function __construct(private readonly AnalyticsService $analyticsService) {}

    public function index(DashboardRequest $request)
    {
        $filters = $request->validated();
        $period = $filters['period'] ?? 'today';
        $lowStockThreshold = (int) ($filters['low_stock_threshold'] ?? 5);

        return inertia('dashboard', $this->analyticsService->getDashboardData($period, $lowStockThreshold));
    }
}
