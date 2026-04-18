<?php

namespace App\Http\Controllers;

use App\Http\Requests\Categories\SearchCategoryRequest;
use App\Http\Requests\Categories\StoreCategoryRequest;
use App\Http\Requests\Categories\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(SearchCategoryRequest $request)
    {
        $data = $request->validated();

        $categories = Category::when($data['search'] ?? null, function ($query) use ($data) {
            $query->where('name', 'like', "%{$data['search']}%");
        })
            ->orderBy('name')
            ->paginate($data['per_page'] ?? 10)
            ->withQueryString();

        return Inertia::render('categories/Index', [
            'categories' => $categories,
            'filters' => [
                'search' => $data['search'] ?? null,
                'per_page' => $data['per_page'] ?? 10,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('categories/Create');
    }

    public function store(StoreCategoryRequest $request)
    {
        $data = $request->validated();
        Category::create($data);

        return redirect()->route('categories.index')
            ->with('success', __('keywords.created', ['name' => __('keywords.category')]));
    }

    public function show(Category $category)
    {
        $category->loadCount('items');

        return Inertia::render('categories/Show', [
            'category' => $category,
        ]);
    }

    public function edit(Category $category)
    {
        return Inertia::render('categories/Edit', [
            'category' => $category,
        ]);
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $data = $request->validated();
        $category->update($data);

        return redirect()->route('categories.index')
            ->with('success', __('keywords.updated', ['name' => __('keywords.category')]));
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->route('categories.index')
            ->with('success', __('keywords.deleted', ['name' => __('keywords.category')]));
    }

    public function searchCategories(SearchCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();

        $categories = Category::when($data['search'] ?? null, function ($query) use ($data) {
            $query->where('name', 'like', "%{$data['search']}%");
        })
            ->orderBy('name')
            ->limit($data['per_page'] ?? 10)
            ->withQueryString();

        return response()->json([
            'data' => $categories,
        ]);
    }

    public function storeCategory(StoreCategoryRequest $request)
    {
        $data = $request->validated();

        return Category::create($data);
    }
}
