<?php

namespace App\Http\Controllers;

use App\Http\Requests\Sales\SearchSaleRequest;
use App\Http\Requests\Sales\StoreSaleRequest;
use App\Http\Requests\Sales\UpdateSaleRequest;
use App\Models\Sale;
use App\Services\SaleService;

class SaleController extends Controller
{
    public function __construct(public SaleService $saleService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(SearchSaleRequest $request)
    {
        $data = $request->validated();

        $sales = Sale::with('customer')
            ->withSum('payments as paid_amount', 'amount')
            ->when($data['search'] ?? null, function ($query, $search) {
                $query->where('customer_name', 'like', "%$search%");
            })
            ->when($data['customer_id'] ?? null, function ($query, $customerId) {
                $query->where('customer_id', $customerId);
            })
            ->when($data['type'] ?? null, function ($query, $type) {
                $query->where('type', $type);
            })
            ->latest()
            ->paginate($data['per_page'] ?? 10)->withQueryString();

        return inertia('Sales/Index', [
            'sales' => $sales,
            'filters' => $data,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSaleRequest $request)
    {
        $data = $request->validated();

        $data['user_id'] = auth()->id();

        $sale = $this->saleService->create($data);

        return redirect()->route('sales.index', $sale)
            ->with('success', __('keywords.created', ['name' => __('keywords.sale')]));
    }

    /**
     * Display the specified resource.
     */
    public function show(Sale $sale)
    {
        $sale->load('customer', 'items', 'paymentAllocations.customerPayment')
            ->loadSum('payments as paid_amount', 'amount');

        return inertia('Sales/Show', [
            'sale' => $sale,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Sale $sale)
    {
        $sale->load('customer', 'items')->loadSum('payments as paid_amount', 'amount');

        return inertia('Sales/Edit', [
            'sale' => $sale,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSaleRequest $request, Sale $sale)
    {
        $data = $request->validated();

        $sale = $this->saleService->update($sale, $data);

        return redirect()->route('sales.index', $sale)
            ->with('success', __('keywords.updated', ['name' => __('keywords.sale')]));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale)
    {
        $sale->delete();

        return redirect()->route('sales.index')
            ->with('success', __('keywords.deleted', ['name' => __('keywords.sale')]));
    }

    public function getSale($id)
    {
        $sale = Sale::findOrFail($id);

        return $sale->load('customer', 'items')->loadSum('payments as paid_amount', 'amount');
    }
}
