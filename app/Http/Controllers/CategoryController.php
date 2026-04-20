<?php

namespace App\Http\Controllers;

use App\Http\Requests\Categories\SearchCategoryRequest;
use App\Http\Requests\Categories\StoreCategoryRequest;
use App\Http\Requests\Categories\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'filters' => [
                'search' => $data['search'] ?? null,
                'per_page' => $data['per_page'] ?? 10,
            ],
        ]);
    }

    public function store(StoreCategoryRequest $request)
    {
        $data = $request->validated();
        Category::create($data);

        return redirect()->route('categories.index')
            ->with('success', __('keywords.created', ['name' => __('keywords.category')]));
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

    public function searchCategories(Request $request): JsonResponse
{
    $search = $request->input('search');

    $categories = Category::when($search, function ($query) use ($search) {
        $query->where('name', 'like', "%{$search}%");
    })
    ->select('id', 'name') 
    ->orderBy('name')
    ->limit(20) 
    ->get(); 

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
