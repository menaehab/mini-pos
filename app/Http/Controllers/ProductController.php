<?php

namespace App\Http\Controllers;

use App\Http\Requests\Products\SearchProductRequest;
use App\Http\Requests\Products\StoreProductRequest;
use App\Http\Requests\Products\UpdateProductRequest;
use App\Models\Product;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(SearchProductRequest $request)
    {
        $data = $request->validated();

        $products = Product::query()->with('category')
            ->when($data['category_id'] ?? null, function ($query, $category_id) {
                $query->where('category_id', $category_id);
            })
            ->when($data['search'] ?? null, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
                $query->orWhere('code', 'like', "%{$search}%");
                $query->orWhere('description', 'like', "%{$search}%");

            })
            ->when($data['stock_status'] ?? null, function ($query, $stock_status) {
                if ($stock_status === 'in_stock') {
                    $query->whereColumn('stock', '>', 'min_stock');
                } elseif ($stock_status === 'out_of_stock') {
                    $query->where('stock', '=', 0);
                } elseif ($stock_status === 'low_stock') {
                    $query->whereColumn('stock', '<=', 'min_stock');
                }
            })

            ->latest()
            ->paginate($data['per_page'] ?? 10)
            ->withQueryString();

        return inertia('Products/Index', [
            'filters' => $data,
            'products' => $products,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('Products/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request)
    {
        $data = $request->validated();

        Product::create($data);

        return redirect()->route('products.index')->with('success', __('keywords.created', ['name' => __('keywords.product')]));
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return inertia('Products/Show', [
            'product' => $product,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        return inertia('Products/Edit', [
            'product' => $product,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product)
    {
        $data = $request->validated();

        $product->update($data);

        return redirect()->route('products.index')->with('success', __('keywords.updated', ['name' => __('keywords.product')]));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('products.index')->with('success', __('keywords.deleted', ['name' => __('keywords.product')]));
    }

    public function searchProducts(SearchProductRequest $request)
    {
        $data = $request->validated();

        $products = Product::query()->with('category')
            ->when($data['category_id'] ?? null, function ($query, $category_id) {
                $query->where('category_id', $category_id);
            })
            ->when($data['search'] ?? null, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
                $query->orWhere('code', 'like', "%{$search}%");
                $query->orWhere('description', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($data['per_page'] ?? 16)->withQueryString();

        return $products;
    }
}
