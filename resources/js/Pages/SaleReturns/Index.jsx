import Table from '@/Components/Table';
import { usePermissions } from '@/hooks/usePermissions';
import useTranslation from '@/hooks/useTranslation';
import MainLayout from '@/Layouts/MainLayout';
import { Head, router } from '@inertiajs/react';
import { ChevronDown, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Index({ saleReturns = {}, filters = {} }) {
    const { __ } = useTranslation();
    const { can } = usePermissions();

    // الفلاتر
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
                route('sale-returns.index'),
                { search: searchQuery, status: statusFilter },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 400);
        return () => clearTimeout(delaySearch);
    }, [searchQuery, statusFilter]);

    // الأعمدة الـ 5 مطابقة للصورة بالملي (بدون عمود الرقم)
    const columns = [
        {
            header: 'رقم فاتورة البيع',
            accessor: 'sale',
            render: (row) => (
                <span className="font-bold text-gray-700">
                    {row.sale?.number || '—'}
                </span>
            ),
        },
        {
            header: 'الإجمالي للمرتجع',
            accessor: 'total_price', // بناءً على السيرفيس بتاعتك اسمها total_price
            render: (row) => (
                <span className="font-bold text-gray-900">
                    {row.total_price || 0} ج.م
                </span>
            ),
        },
        {
            header: 'استرداد نقدي',
            accessor: 'is_refunded',
            render: (row) => (
                <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${row.is_refunded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                >
                    {row.is_refunded ? 'نعم' : 'لا'}
                </span>
            ),
        },
        {
            header: 'المستخدم',
            accessor: 'user',
            render: (row) => (
                <span className="text-gray-600">{row.user?.name || '—'}</span>
            ),
        },
        {
            header: 'تاريخ الإنشاء',
            accessor: 'created_at',
            render: (row) => (
                <span dir="ltr" className="text-sm text-gray-600">
                    {new Date(row.created_at).toLocaleDateString('ar-EG')}
                </span>
            ),
        },
    ];

    return (
        <>
            <Head title="مرتجع المبيعات" />

            <div
                className="relative mx-auto mb-8 max-w-7xl font-['Cairo']"
                dir="rtl"
            >
                <div className="mb-6 flex items-center justify-start">
                    <h1 className="text-2xl font-bold text-gray-800">
                        مرتجع المبيعات
                    </h1>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex w-full items-center gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="بحث"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 py-3 pl-4 pr-10 text-right text-sm transition-colors focus:border-black focus:outline-none"
                            />
                            <Search
                                className="absolute right-3 top-3.5 text-gray-400"
                                size={18}
                            />
                        </div>

                        <div className="relative w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                                className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-transparent py-3 pl-10 pr-4 text-right text-sm text-gray-600 focus:border-black focus:outline-none"
                            >
                                <option value="">كل الحالات</option>
                                <option value="completed">مكتمل</option>
                                <option value="pending">قيد الانتظار</option>
                            </select>
                            <ChevronDown
                                className="absolute left-4 top-3.5 text-gray-400"
                                size={16}
                            />
                        </div>

                        <button
                            onClick={() =>
                                router.get(route('sale-returns.create'))
                            }
                            className="whitespace-nowrap rounded-xl bg-black px-10 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-gray-800"
                        >
                            اضافة مرتجع
                        </button>
                    </div>

                    <Table
                        columns={columns}
                        data={saleReturns?.data || []}
                        pagination={saleReturns}
                    />
                </div>
            </div>
        </>
    );
}

Index.layout = (page) => <MainLayout>{page}</MainLayout>;
