<?php

namespace App\Http\Controllers;

use App\Http\Requests\Expenses\SearchExpenseRequest;
use App\Http\Requests\Expenses\StoreExpenseRequest;
use App\Http\Requests\Expenses\UpdateExpenseRequest;
use App\Models\Expense;

class ExpenseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(SearchExpenseRequest $request)
    {
        $data = $request->validated();

        $expenses = auth()->user()->expenses()
            ->when($data['search'] ?? null, function ($query, $search) {
                $query->where('description', 'like', "%$search%");
            })
            ->latest()
            ->paginate($data['per_page'] ?? 10)
            ->withQueryString();

        return inertia('Expenses/Index', [
            'expenses' => $expenses,
            'filters' => $data,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreExpenseRequest $request)
    {
        $data = $request->validated();

        auth()->user()->expenses()->create($data);

        return back()->with('success', __('keywords.created', ['name' => 'expense']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateExpenseRequest $request, Expense $expense)
    {
        $data = $request->validated();

        $expense->update($data);

        return back()->with('success', __('keywords.updated', ['name' => 'expense']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Expense $expense)
    {
        $expense->delete();

        return back()->with('success', __('keywords.deleted', ['name' => 'expense']));
    }
}
