<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaleReturns\SearchSaleReturnRequest;
use App\Http\Requests\SaleReturns\StoreSaleReturnRequest;
use App\Http\Requests\SaleReturns\UpdateSaleReturnRequest;
use App\Models\Sale;
use App\Models\SaleReturn;
use App\Models\SaleReturnItem;
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

    public function findSaleByNumber(string $number)
    {
        $sale = Sale::query()
            ->with('items')
            ->where('number', $number)
            ->first();

        if (! $sale) {
            return response()->json([
                'message' => 'الفاتورة غير موجودة',
            ], 404);
        }

        $soldByProduct = $sale->items
            ->groupBy('product_id')
            ->map(function ($items) {
                $first = $items->first();

                return [
                    'product_id' => (int) $first->product_id,
                    'name' => (string) $first->product_name,
                    'sale_price' => (float) $first->sale_price,
                    'sold_qty' => (int) $items->sum('quantity'),
                ];
            });

        $returnedByProduct = SaleReturnItem::query()
            ->whereIn('product_id', $soldByProduct->keys()->all())
            ->whereHas('saleReturn', fn ($query) => $query->where('sale_id', $sale->id))
            ->selectRaw('product_id, SUM(quantity) as total')
            ->groupBy('product_id')
            ->pluck('total', 'product_id');

        $items = $soldByProduct
            ->map(function ($item) use ($returnedByProduct) {
                $returned = (int) ($returnedByProduct[$item['product_id']] ?? 0);
                $remainingQty = max(0, $item['sold_qty'] - $returned);

                return [
                    'product_id' => $item['product_id'],
                    'name' => $item['name'],
                    'sale_price' => $item['sale_price'],
                    'max_qty' => $remainingQty,
                ];
            })
            ->filter(fn ($item) => $item['max_qty'] > 0)
            ->values();

        return response()->json([
            'sale_id' => $sale->id,
            'number' => $sale->number,
            'customer_name' => $sale->customer_name,
            'items' => $items,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSaleReturnRequest $request)
    {
        $data = $request->validated();

        $this->saleReturnService->create($data, (int) auth()->id());

        return redirect()->route('sale-returns.index')->with('success', __('keywords.created', ['name' => 'sale_return']));
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

        return redirect()->route('sale-returns.index')->with('success', __('keywords.updated', ['name' => 'sale_return']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SaleReturn $saleReturn)
    {
        $this->saleReturnService->delete($saleReturn);

        return redirect()->route('sale-returns.index')
            ->with('success', __('keywords.deleted', ['name' => 'sale_return']));
    }
}
