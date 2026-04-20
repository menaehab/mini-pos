import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import Table from '@/Components/Table';
import { Search, ChevronDown } from 'lucide-react';
import { Head, router } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';
import { usePermissions } from '@/hooks/usePermissions';

export default function Index({ returns = {}, filters = {} }) {
    const { __ } = useTranslation();
    const { can } = usePermissions();
    
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const delaySearch = setTimeout(() => {
            router.get(
                route('sales-returns.index'), 
                { search: searchQuery, status: statusFilter }, 
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 400);
        return () => clearTimeout(delaySearch);
    }, [searchQuery, statusFilter]);

    // الأعمدة مطابقة للصورة بالظبط
    const columns = [
        { header: 'الرقم', accessor: 'return_number' },
        { 
            header: 'رقم فاتورة البيع', 
            accessor: 'sale',
            render: (row) => <span className="font-bold text-gray-700">{row.sale?.invoice_number || '—'}</span> 
        },
        { 
            header: 'الإجمالي للمرتجع', 
            accessor: 'total_returned',
            render: (row) => <span className="font-bold text-gray-900">{row.total_returned || 0} ج.م</span>
        },
        { 
            header: 'استرداد نقدي', 
            accessor: 'cash_refund',
            render: (row) => (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.cash_refund ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {row.cash_refund ? 'نعم' : 'لا'}
                </span>
            )
        },
        { 
            header: 'المستخدم', 
            accessor: 'user',
            render: (row) => row.user?.name || '—'
        },
        { 
            header: 'تاريخ الإنشاء', 
            accessor: 'created_at',
            render: (row) => (
                <span dir="ltr" className="text-sm text-gray-600">
                    {new Date(row.created_at).toLocaleDateString('ar-EG')}
                </span>
            )
        },
    ];

    return (
        <>
            <Head title="مرتجعات المبيعات" />
            
            <div className="relative mx-auto mb-8 max-w-7xl font-['Cairo']" dir="rtl">
                
                {/* الهيدر */}
                <div className="mb-6 flex items-center justify-end">
                    <h1 className="text-2xl font-bold text-gray-800">
                        المبيعات
                    </h1>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex w-full items-center justify-between gap-4">
                        
                        {/* زرار الإضافة (أسود زي الصورة) */}
                        {can('manage_sales_returns') && (
                            <button 
                                onClick={() => router.get(route('sales-returns.create'))} 
                                className="whitespace-nowrap rounded-xl bg-black px-8 py-3 text-sm font-bold text-white hover:bg-gray-800 transition-colors shadow-md"
                            >
                                اضافة مرتجع
                            </button>
                        )}

                        {/* الفلاتر والبحث */}
                        <div className="flex items-center gap-4 flex-1 justify-end">
                            
                            {/* فلتر الحالات */}
                            <div className="relative w-48">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-right text-sm text-gray-600 focus:border-black focus:outline-none bg-transparent cursor-pointer"
                                    dir="rtl"
                                >
                                    <option value="">كل الحالات</option>
                                    <option value="completed">مكتمل</option>
                                    <option value="pending">قيد الانتظار</option>
                                </select>
                                <ChevronDown className="absolute left-4 top-3.5 text-gray-400" size={16} />
                            </div>

                            {/* شريط البحث */}
                            <div className="relative w-80">
                                <input
                                    type="text"
                                    placeholder="بحث"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 py-3 pl-4 pr-10 text-right focus:border-black focus:outline-none text-sm"
                                />
                                <Search className="absolute right-3 top-3 text-gray-400" size={18} />
                            </div>

                        </div>
                    </div>

                    <Table 
                        columns={columns} 
                        data={returns?.data || []} 
                        pagination={returns}
                        canView={can('view_sales_returns')}
                    />
                </div>
            </div>
        </>
    );
}

Index.layout = (page) => <MainLayout>{page}</MainLayout>;