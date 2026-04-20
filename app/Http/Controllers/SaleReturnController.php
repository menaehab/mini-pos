<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaleReturns\SearchSaleReturnRequest;
use App\Http\Requests\SaleReturns\StoreSaleReturnRequest;
use App\Http\Requests\SaleReturns\UpdateSaleReturnRequest;
use App\Models\SaleReturn;
use App\Services\SaleReturnService;

class SaleReturnController extends Controller
{
    public function __construct(public SaleReturnService $saleReturnService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(SearchSaleReturnRequest $request)
    {
        $data = $request->validated();

        $saleReturns = SaleReturn::with(['sale.customer', 'user'])
            ->when($data['search'] ?? null, function ($query, $search) {
                $query->whereHas('sale', function ($saleQuery) use ($search) {
                    $saleQuery->where('customer_name', 'like', '%'.$search.'%');
                });
            })
            ->when($data['customer_id'] ?? null, function ($query, $customerId) {
                $query->whereHas('sale', function ($saleQuery) use ($customerId) {
                    $saleQuery->where('customer_id', $customerId);
                });
            })
            ->latest()
            ->paginate($data['per_page'] ?? 10)
            ->withQueryString();

        return inertia('SaleReturns/Index', [
            'saleReturns' => $saleReturns,
            'filters' => $data,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('SaleReturns/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSaleReturnRequest $request)
    {
        $data = $request->validated();

        $this->saleReturnService->create($data, (int) auth()->id());

        return back()->with('success', __('keywords.created', ['name' => 'sale_return']));
    }

    /**
     * Display the specified resource.
     */
    public function show(SaleReturn $saleReturn)
    {
        return inertia('SaleReturns/Show', [
            'saleReturn' => $saleReturn->load('sale.customer', 'items.product', 'user'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SaleReturn $saleReturn)
    {
        return inertia('SaleReturns/Edit', [
            'saleReturn' => $saleReturn->load('sale.customer', 'items.product'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSaleReturnRequest $request, SaleReturn $saleReturn)
    {
        $data = $request->validated();

        $this->saleReturnService->update($saleReturn, $data);

        return back()->with('success', __('keywords.updated', ['name' => 'sale_return']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SaleReturn $saleReturn)
    {
        $saleReturn->delete();

        return back()->with('success', __('keywords.deleted', ['name' => 'sale_return']));
    }
}
