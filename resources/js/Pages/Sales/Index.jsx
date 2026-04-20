import DeleteConfirmModal from '@/Components/DeleteConfirmModal';
import Table from '@/Components/Table';
import { usePermissions } from '@/hooks/usePermissions';
import useTranslation from '@/hooks/useTranslation';
import MainLayout from '@/Layouts/MainLayout';
import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Index({ sales = {}, filters = {} }) {
    const { __ } = useTranslation();
    const { can } = usePermissions();

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [saleToDelete, setSaleToDelete] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [saleToPay, setSaleToPay] = useState(null);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const delaySearch = setTimeout(() => {
            router.get(
                route('sales.index'),
                { search: searchQuery, per_page: perPage },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 400);
        return () => clearTimeout(delaySearch);
    }, [searchQuery, perPage]);

    const handleDelete = (sale) => {
        setSaleToDelete(sale);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setDeleteProcessing(true);
        router.delete(route('sales.destroy', saleToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSaleToDelete(null);
                setDeleteProcessing(false);
            },
            onError: () => setDeleteProcessing(false),
        });
    };

    const handleEdit = (sale) => {
        // غالباً تعديل الفاتورة بيفتح صفحة مش مودال
        router.get(route('sales.edit', sale.id));
    };

    const handleView = (sale) => {
        router.get(route('sales.show', sale.id));
    };

    const handlePay = (sale) => {
        setSaleToPay(sale);
        setIsPaymentModalOpen(true);
        // أو لو عندك صفحة مخصصة للسداد:
        // router.get(route('sales.payment', sale.id));
    };

    // تعريف الأعمدة
    const columns = [
        { header: __('keywords.invoice_number'), accessor: 'number' },
        {
            header: __('keywords.customer'),
            accessor: 'customer',
            render: (row) => (
                <span className="font-bold text-gray-800">
                    {row.customer?.name || __('keywords.cash_customer')}
                </span>
            ),
        },
        {
            header: __('keywords.total'),
            accessor: 'total',
            render: (row) => (
                <span className="font-bold text-gray-900">
                    {row.total || 0} ج.م
                </span>
            ),
        },
        {
            header: __('keywords.paid'),
            accessor: 'paid',
            render: (row) => (
                <span className="font-bold text-green-600">
                    {row.paid || 0} ج.م
                </span>
            ),
        },
        {
            header: __('keywords.remaining'),
            accessor: 'remaining',
            render: (row) => (
                <span className="font-bold text-red-600">
                    {row.remaining || 0} ج.م
                </span>
            ),
        },
        {
            header: __('keywords.status'),
            accessor: 'status',
            render: (row) => {
                let badgeClass = 'bg-gray-100 text-gray-700 border-gray-200';
                let statusText = row.status;

                if (row.status === 'paid') {
                    badgeClass = 'bg-green-100 text-green-700 border-green-200';
                    statusText = __('keywords.paid_status');
                } else if (row.status === 'unpaid') {
                    badgeClass = 'bg-red-100 text-red-700 border-red-200';
                    statusText = __('keywords.unpaid_status');
                } else if (row.status === 'partial') {
                    badgeClass =
                        'bg-yellow-100 text-yellow-700 border-yellow-200';
                    statusText = __('keywords.partial_status');
                }

                return (
                    <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${badgeClass}`}
                    >
                        {statusText}
                    </span>
                );
            },
        },
        {
            header: __('keywords.created_date'),
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
            <Head title={__('keywords.sales')} />

            <div
                className="relative mx-auto mb-8 max-w-7xl font-['Cairo']"
                dir="rtl"
            >
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {__('keywords.sales')}
                    </h1>
                </div>

                <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
                    <div className="flex items-center justify-between w-full gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="relative w-72">
                                <input
                                    type="text"
                                    placeholder={__('keywords.search')}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full py-2 pl-4 pr-10 text-right border border-gray-200 rounded-lg focus:border-black focus:outline-none"
                                />
                                <Search
                                    className="absolute right-3 top-2.5 text-gray-400"
                                    size={18}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                    {__('keywords.show')}
                                </span>
                                <select
                                    value={perPage}
                                    onChange={(e) => setPerPage(e.target.value)}
                                    className="px-2 py-2 text-center border border-gray-200 rounded-lg appearance-none cursor-pointer bg-none focus:border-black focus:outline-none"
                                    dir="ltr"
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                        </div>

                        {/* زرار نقطة البيع اللي بيودي لصفحة الكاشير */}
                        {can('manage_sales') && (
                            <button
                                onClick={() => router.get(route('home'))}
                                className="whitespace-nowrap rounded-lg bg-[#1a202c] px-6 py-2.5 text-sm font-bold text-white hover:bg-black"
                            >
                                {__('keywords.add_invoice')}
                            </button>
                        )}
                    </div>

                    <Table
                        columns={columns}
                        data={sales?.data || []}
                        pagination={sales}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onPay={handlePay}
                        canView={can('view_sales')}
                        canEdit={can('manage_sales')}
                        canDelete={can('manage_sales')}
                    />
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setSaleToDelete(null);
                }}
                onConfirm={confirmDelete}
                userName={saleToDelete?.id}
                entityName={__('keywords.invoice_number')}
                processing={deleteProcessing}
            />

            {/* مودال السداد هنعمله بعدين */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="p-6 text-center bg-white w-96 rounded-2xl">
                        <h3 className="mb-4 text-lg font-bold">
                            سداد الفاتورة: {saleToPay?.invoice_number}
                        </h3>
                        <p className="mb-6 text-gray-500">
                            المتبقي: {saleToPay?.remaining} ج.م
                        </p>
                        <button
                            onClick={() => setIsPaymentModalOpen(false)}
                            className="px-6 py-2 text-white bg-black rounded-lg"
                        >
                            إغلاق مؤقتاً
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

Index.layout = (page) => <MainLayout>{page}</MainLayout>;
