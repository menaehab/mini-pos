import DeleteConfirmModal from '@/Components/DeleteConfirmModal';
import Table from '@/Components/Table';
import { usePermissions } from '@/hooks/usePermissions';
import useTranslation from '@/hooks/useTranslation';
import MainLayout from '@/Layouts/MainLayout';
import { Head, router } from '@inertiajs/react';
import { ChevronDown, Edit, Eye, Printer, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Index({ purchases = {}, filters = {} }) {
    const { __ } = useTranslation();
    const { can } = usePermissions();

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [paymentFilter, setPaymentFilter] = useState(
        filters.payment_method || '',
    );
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [dateFilter, setDateFilter] = useState(filters.date || '');

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [purchaseToDelete, setPurchaseToDelete] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const delaySearch = setTimeout(() => {
            router.get(
                route('purchases.index'),
                {
                    search: searchQuery,
                    status: statusFilter,
                    payment_method: paymentFilter,
                    date: dateFilter,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 400);
        return () => clearTimeout(delaySearch);
    }, [searchQuery, statusFilter, paymentFilter, dateFilter]);

    const handleDelete = (purchase) => {
        setPurchaseToDelete(purchase);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setDeleteProcessing(true);
        router.delete(route('purchases.destroy', purchaseToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setPurchaseToDelete(null);
                setDeleteProcessing(false);
            },
            onError: () => setDeleteProcessing(false),
        });
    };

    const columns = [
        { header: 'الرقم', accessor: 'invoice_number' },
        {
            header: 'المورد',
            accessor: 'supplier',
            render: (row) => (
                <span className="text-gray-800">
                    {row.supplier?.name || '—'}
                </span>
            ),
        },
        {
            header: 'الإجمالي',
            accessor: 'total',
            render: (row) => (
                <span className="font-bold text-gray-800">
                    {row.total || 0} ج.م
                </span>
            ),
        },
        {
            header: 'المدفوع',
            accessor: 'paid',
            render: (row) => (
                <span className="text-gray-600">{row.paid || 0} ج.م</span>
            ),
        },
        {
            header: 'المتبقي',
            accessor: 'remaining',
            render: (row) => (
                <span className="text-gray-600">{row.remaining || 0} ج.م</span>
            ),
        },
        {
            header: 'طريقة الدفع',
            accessor: 'payment_method',
            render: (row) => (
                <span className="text-gray-600">
                    {row.payment_method === 'credit' ? 'آجل' : 'نقدي'}
                </span>
            ),
        },
        {
            header: 'الحالة',
            accessor: 'status',
            render: (row) => (
                <span className="text-gray-600">
                    {row.status === 'paid' ? 'مسدد بالكامل' : 'غير مسدد'}
                </span>
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

    const renderActions = (row) => (
        <div className="flex items-center gap-3 text-gray-400">
            {can('manage_purchases') && (
                <button
                    onClick={() => handleDelete(row)}
                    className="transition-colors hover:text-red-500"
                >
                    <Trash2 size={16} />
                </button>
            )}
            {can('manage_purchases') && (
                <button
                    onClick={() => router.get(route('purchases.edit', row.id))}
                    className="transition-colors hover:text-blue-600"
                >
                    <Edit size={16} />
                </button>
            )}
            {can('view_purchases') && (
                <button
                    onClick={() => router.get(route('purchases.show', row.id))}
                    className="transition-colors hover:text-gray-800"
                >
                    <Eye size={16} />
                </button>
            )}
            {can('view_purchases') && (
                <button
                    onClick={() => window.print()}
                    className="transition-colors hover:text-gray-800"
                >
                    <Printer size={16} />
                </button>
            )}
        </div>
    );

    return (
        <>
            <Head title="المشتريات" />

            <div
                className="relative mx-auto mb-8 max-w-7xl font-['Cairo']"
                dir="rtl"
            >
                <div className="mb-6 flex items-center justify-start">
                    <h1 className="text-2xl font-bold text-gray-800">
                        المشتريات
                    </h1>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex w-full flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-1 flex-wrap items-center gap-3">
                            <div className="relative w-80">
                                <input
                                    type="text"
                                    placeholder="بحث"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-gray-200 py-2.5 pl-4 pr-10 text-right text-sm focus:border-black focus:outline-none"
                                />
                                <Search
                                    className="absolute right-3 top-3 text-gray-400"
                                    size={18}
                                />
                            </div>

                            <div className="relative w-36">
                                <select
                                    value={paymentFilter}
                                    onChange={(e) =>
                                        setPaymentFilter(e.target.value)
                                    }
                                    className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-transparent py-2.5 pl-8 pr-4 text-right text-sm text-gray-500 focus:border-black focus:outline-none"
                                >
                                    <option value="">طرق الدفع</option>
                                    <option value="cash">نقدي</option>
                                    <option value="credit">آجل</option>
                                </select>
                                <ChevronDown
                                    className="absolute left-3 top-3 text-gray-400"
                                    size={16}
                                />
                            </div>

                            <div className="relative w-36">
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(e.target.value)
                                    }
                                    className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-transparent py-2.5 pl-8 pr-4 text-right text-sm text-gray-500 focus:border-black focus:outline-none"
                                >
                                    <option value="">كل الحالات</option>
                                    <option value="paid">مسدد بالكامل</option>
                                    <option value="unpaid">غير مسدد</option>
                                </select>
                                <ChevronDown
                                    className="absolute left-3 top-3 text-gray-400"
                                    size={16}
                                />
                            </div>

                            <div className="relative w-40">
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) =>
                                        setDateFilter(e.target.value)
                                    }
                                    className="w-full cursor-pointer rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-400 focus:border-black focus:outline-none"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {can('manage_purchases') && (
                            <button
                                onClick={() =>
                                    router.get(route('purchases.create'))
                                }
                                className="whitespace-nowrap rounded-xl bg-black px-6 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-gray-800"
                            >
                                اضافة فاتورة شراء
                            </button>
                        )}
                    </div>

                    <Table
                        columns={columns}
                        data={purchases?.data || []}
                        pagination={purchases}
                        customActions={renderActions}
                    />
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setPurchaseToDelete(null);
                }}
                onConfirm={confirmDelete}
                userName={purchaseToDelete?.invoice_number}
                entityName="فاتورة الشراء"
                processing={deleteProcessing}
            />
        </>
    );
}

Index.layout = (page) => <MainLayout>{page}</MainLayout>;
