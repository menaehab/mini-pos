import React, { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ChevronLeft, Search } from 'lucide-react';

export default function Create() {
    

    const [invoiceProducts, setInvoiceProducts] = useState([
        { id: 1, name: 'قطن', price: 100, max_qty: 50 }, 
        { id: 2, name: 'قماش حرير', price: 250, max_qty: 20 },
    ]);

    const { data, setData, post, processing, errors } = useForm({
        invoice_number: '',
        reason: '',
        cash_refund: true,
  
        items: invoiceProducts.map(p => ({ ...p, return_qty: 0, selected: false }))
    });

    const calculateTotals = () => {
        let count = 0;
        let total = 0;
        data.items.forEach(item => {
            if (item.selected && item.return_qty > 0) {
                count += 1;
                total += (item.return_qty * item.price);
            }
        });
        return { count, total };
    };

    const { count: selectedCount, total: returnTotal } = calculateTotals();

    const handleQtyChange = (id, newQty) => {
        setData('items', data.items.map(item => {
            if (item.id === id) {
                const validQty = Math.min(Math.max(0, newQty), item.max_qty);
                return { ...item, return_qty: validQty, selected: validQty > 0 };
            }
            return item;
        }));
    };

    const toggleSelect = (id) => {
        setData('items', data.items.map(item => {
            if (item.id === id) {
                const newSelected = !item.selected;
                return { ...item, selected: newSelected, return_qty: newSelected ? 1 : 0 };
            }
            return item;
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...data,
            items: data.items.filter(item => item.selected && item.return_qty > 0)
        };
        console.log("Data to send:", payload);
        post(route('purchases-returns.store'), payload);
    };

    return (
        <>
            <Head title="انشاء مرتجع مشتريات" />
            
            <div className="relative mx-auto mb-8 max-w-5xl font-['Cairo']" dir="rtl">
                
                
                <div className="mb-6 flex items-center gap-3 text-2xl font-bold">
                    <Link href={route('purchases-returns.index')} className="text-gray-500 hover:text-gray-800 transition-colors">
                        مرتجع المشتريات
                    </Link>
                    <ChevronLeft size={22} className="text-gray-400 mt-1" strokeWidth={2.5} />
                    <span className="text-gray-900">انشاء مرتجع</span>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    
                    
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            رقم فاتورة الشراء <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="بحث"
                                value={data.invoice_number}
                                onChange={e => setData('invoice_number', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 py-3 pr-4 pl-10 text-right focus:border-black focus:outline-none"
                            />
                            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-500">حدد المنتجات التي تريد ارجاعها و ادخل الكميه لكل منتج</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-sm">
                                <thead className="bg-gray-50 text-gray-500">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold w-1/3">المنتج</th>
                                        <th className="px-6 py-3 font-semibold">سعر الشراء</th> {/* تم التعديل */}
                                        <th className="px-6 py-3 font-semibold">الكمية المتاحة</th>
                                        <th className="px-6 py-3 font-semibold w-40 text-center">كمية الارجاع</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={item.selected}
                                                        onChange={() => toggleSelect(item.id)}
                                                        className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                                                    />
                                                    <span className="font-bold text-gray-800">{item.name}</span>
                                                </label>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-700">{item.price} ج.م</td>
                                            <td className="px-6 py-4 text-gray-500">{item.max_qty}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden w-24 mx-auto">
                                                    <button type="button" onClick={() => handleQtyChange(item.id, item.return_qty + 1)} className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600">+</button>
                                                    <input 
                                                        type="number" 
                                                        value={item.return_qty}
                                                        onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 0)}
                                                        className="w-10 text-center border-none p-0 text-sm font-bold focus:ring-0"
                                                        min="0"
                                                        max={item.max_qty}
                                                    />
                                                    <button type="button" onClick={() => handleQtyChange(item.id, item.return_qty - 1)} className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600">-</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                 
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800">تفاصيل المرتجع</h3>
                        </div>
                        
                        <div className="p-6 flex flex-col gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">السبب</label>
                                <textarea
                                    rows="3"
                                    placeholder="ادخل سبب الارجاع"
                                    value={data.reason}
                                    onChange={e => setData('reason', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 p-4 text-right focus:border-black focus:outline-none resize-none text-sm"
                                ></textarea>
                            </div>

                            <div className="flex justify-end items-center gap-4 border-b border-gray-50 pb-6">
                                <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                    استرداد نقدي 
                                </span>
                                <div className="flex bg-gray-100 rounded-full p-1">
                                    <button 
                                        type="button"
                                        onClick={() => setData('cash_refund', false)}
                                        className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all ${!data.cash_refund ? 'bg-white shadow-sm text-black border border-gray-200' : 'text-gray-500 hover:text-black'}`}
                                    >
                                        لا
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setData('cash_refund', true)}
                                        className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all ${data.cash_refund ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}
                                    >
                                        نعم
                                    </button>
                                </div>
                            </div>
                        </div>

                        
                        <div className="bg-gray-50/80 p-6 flex items-center gap-8 justify-start">
                            <button 
                                type="submit" 
                                disabled={processing || selectedCount === 0}
                                className="bg-black text-white rounded-xl px-10 py-3 font-bold shadow-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                                حفظ المرتجع
                            </button>
                            
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-semibold text-gray-600">
                                    عدد المنتجات المحددة : <span className="text-black font-bold mx-1">{selectedCount}</span>
                                </span>
                                <span className="text-sm font-semibold text-gray-600">
                                    اجمالي المرتجع : <span className="text-red-600 font-bold mx-1 text-lg">{returnTotal}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </>
    );
}

Create.layout = (page) => <MainLayout>{page}</MainLayout>;