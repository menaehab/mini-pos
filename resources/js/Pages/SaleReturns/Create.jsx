import React, { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Search } from 'lucide-react';

export default function Create() {
    
    const [invoiceProducts, setInvoiceProducts] = useState([
        { id: 1, product_id: 1, name: 'قطن', sale_price: 20.00, max_qty: 100 },
    ]);

    const { data, setData, post, processing } = useForm({
        sale_id: 1, 
        invoice_number_search: '',
        note: '',
        is_refunded: false, 
        items: invoiceProducts.map(p => ({ ...p, quantity: 3, selected: true })) 
    });

    const calculateTotals = () => {
        let count = 0;
        let total = 0;
        data.items.forEach(item => {
            if (item.selected && item.quantity > 0) {
                count += 1;
                total += (item.quantity * item.sale_price);
            }
        });
        return { count, total };
    };

    const { count: selectedCount, total: returnTotal } = calculateTotals();

    const handleQtyChange = (id, newQty) => {
        setData('items', data.items.map(item => {
            if (item.id === id) {
                const validQty = Math.min(Math.max(0, newQty), item.max_qty);
                return { ...item, quantity: validQty, selected: validQty > 0 };
            }
            return item;
        }));
    };

    const toggleSelect = (id) => {
        setData('items', data.items.map(item => {
            if (item.id === id) {
                const newSelected = !item.selected;
                return { ...item, selected: newSelected, quantity: newSelected ? 1 : 0 };
            }
            return item;
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...data,
            items: data.items.filter(item => item.selected && item.quantity > 0)
        };
        
        console.log("Submitting:", payload);
        
        
        post(route('sale-returns.store'), {
            data: payload,
            preserveScroll: true
        });
    };

    return (
        <>
            <Head title="انشاء مرتجع مبيعات" />
            
            <div className="relative mx-auto mb-58 max-w-5xl font-['Cairo']" dir="rtl">
                
              
                <div className="mb-6 flex items-center justify-start gap-3 text-2xl font-bold">
                    <Link href={route('sale-returns.index')} className="text-gray-500 hover:text-gray-800 transition-colors">
                        مرتجع المبيعات
                    </Link>
                    <ChevronLeft size={22} className="text-gray-400 mt-1" strokeWidth={2.5} />
                    <span className="text-gray-900">انشاء مرتجع</span>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    
                   
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            رقم فاتورة البيع <span className="text-red-500">*</span> 
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="بحث"
                                value={data.invoice_number_search}
                                onChange={e => setData('invoice_number_search', e.target.value)}
                                className="w-full rounded-xl border border-gray-200 py-3 pr-10 pl-4 text-right focus:border-black focus:outline-none text-sm placeholder:text-gray-300"
                            />
                            <Search className="absolute right-4 top-3.5 text-gray-300" size={18} />
                        </div>
                    </div>

                    
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-end">
                            <h3 className="text-xs font-semibold text-gray-400">حدد المنتجات التي تريد ارجاعها و ادخل الكميه لكل منتج</h3>
                        </div>
                        <div className="overflow-x-auto p-4">
                            <table className="w-full text-right text-sm">
                                <thead className="text-gray-400 border-b border-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-xs text-right w-1/3">المنتج</th>
                                        <th className="px-6 py-4 font-semibold text-xs text-center">سعر البيع</th>
                                        <th className="px-6 py-4 font-semibold text-xs text-center">الكمية المتاحة</th>
                                        <th className="px-6 py-4 font-semibold text-xs text-left">كمية الارجاع</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            
                                            <td className="px-6 py-4">
                                                <label className="flex items-center gap-3 cursor-pointer w-fit">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={item.selected}
                                                        onChange={() => toggleSelect(item.id)}
                                                        className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                                                    />
                                                    <span className="font-bold text-gray-800">{item.name}</span>
                                                </label>
                                            </td>

                                            <td className="px-6 py-4 font-bold text-gray-800 text-center">{item.sale_price} ج.م</td>
                                            
                                            <td className="px-6 py-4 font-bold text-gray-800 text-center">{item.max_qty}</td>
                                            
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden w-24 mr-auto">
                                                    <button type="button" onClick={() => handleQtyChange(item.id, item.quantity + 1)} className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold">+</button>
                                                    <input 
                                                        type="number" 
                                                        value={item.quantity}
                                                        onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value) || 0)}
                                                        className="w-10 text-center border-none p-0 text-sm font-bold focus:ring-0"
                                                    />
                                                    <button type="button" onClick={() => handleQtyChange(item.id, item.quantity - 1)} className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold">-</button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

             
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-end">
                            <h3 className="font-bold text-gray-800 text-sm">تفاصيل المرتجع</h3>
                        </div>
                        
                        <div className="p-6 flex flex-col gap-6">
                            <div className="flex flex-col items-end">
                                <label className="block text-xs font-bold text-gray-800 mb-2">السبب</label>
                                <textarea
                                    rows="3"
                                    placeholder="ادخل سبب للارجاع"
                                    value={data.note}
                                    onChange={e => setData('note', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 p-4 text-right focus:border-black focus:outline-none resize-none text-sm placeholder:text-gray-300"
                                ></textarea>
                            </div>

                            <div className="flex justify-end items-center gap-4">
                                <span className="text-xs font-bold text-gray-800 flex items-center gap-2">
                                    استرداد نقدي 
                                </span>
                                <div className="flex bg-white border border-gray-200 rounded-full p-1 w-32 shadow-sm">
                                    <button 
                                        type="button"
                                        onClick={() => setData('is_refunded', false)}
                                        className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${!data.is_refunded ? 'bg-white shadow-sm border border-gray-100 text-black' : 'text-gray-500 hover:text-black'}`}
                                    >
                                        لا
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setData('is_refunded', true)}
                                        className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all ${data.is_refunded ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}
                                    >
                                        نعم
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 flex justify-start border-t border-gray-50">
                            <div className="bg-[#f3f4f6] rounded-[20px] px-6 py-4 flex items-center justify-between gap-8 min-w-[320px]">
                                
                                <button 
                                    type="submit" 
                                    disabled={processing || selectedCount === 0}
                                    className="bg-black text-white rounded-xl px-8 py-3 text-sm font-bold shadow-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    حفظ المرتجع
                                </button>

                                <div className="flex flex-col gap-1 text-right text-[13px] font-bold text-gray-600">
                                    <div>
                                        عدد المنتجات المحدده : <span className="text-[#dc2626] text-[15px] mx-1">{selectedCount}</span>
                                    </div>
                                    <div>
                                        اجمالي المرتجع : <span className="text-[#dc2626] text-[15px] mx-1">{returnTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </>
    );
}

Create.layout = (page) => <MainLayout>{page}</MainLayout>;