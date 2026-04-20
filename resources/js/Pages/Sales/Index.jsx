import DeleteConfirmModal from '@/Components/DeleteConfirmModal';
import Table from '@/Components/Table';
import { usePermissions } from '@/hooks/usePermissions';
import useTranslation from '@/hooks/useTranslation';
import MainLayout from '@/Layouts/MainLayout';
import { Head, router, useForm } from '@inertiajs/react';
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

    const paymentForm = useForm({
        amount: '',
        note: '',
        customer_id: '',
        sale_id: '',
    });

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
        paymentForm.setData({
            amount: sale.remaining || '',
            note: '',
            customer_id: sale.customer_id || '',
            sale_id: sale.id,
        });
        paymentForm.clearErrors();
        setIsPaymentModalOpen(true);
    };

    const submitPayment = (e) => {
        e.preventDefault();

        paymentForm.post(route('customer-payments.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                setSaleToPay(null);
                paymentForm.reset();
                router.reload({ only: ['sales'] });
            },
        });
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
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {__('keywords.sales')}
                    </h1>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex w-full items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative w-72">
                                <input
                                    type="text"
                                    placeholder={__('keywords.search')}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-200 py-2 pl-4 pr-10 text-right focus:border-black focus:outline-none"
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
                                    className="cursor-pointer appearance-none rounded-lg border border-gray-200 bg-none px-2 py-2 text-center focus:border-black focus:outline-none"
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
                    <div
                        className="w-full max-w-md rounded-2xl bg-white p-6 text-right shadow-xl"
                        dir="rtl"
                    >
                        <h3 className="mb-2 text-lg font-bold text-gray-900">
                            {__('keywords.payment')} #
                            {saleToPay?.number || saleToPay?.id}
                        </h3>
                        <p className="mb-4 text-sm text-gray-500">
                            {__('keywords.remaining')}:{' '}
                            {Number(saleToPay?.remaining || 0).toFixed(2)} ج.م
                        </p>

                        <form onSubmit={submitPayment} className="space-y-3">
                            <div>
                                <label className="mb-1 block text-xs font-bold text-gray-500">
                                    {__('keywords.amount_paid')}
                                </label>
                                <input
                                    type="number"
                                    min="0.01"
                                    max={saleToPay?.remaining || undefined}
                                    step="0.01"
                                    value={paymentForm.data.amount}
                                    onChange={(e) =>
                                        paymentForm.setData(
                                            'amount',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-right text-sm focus:border-black focus:outline-none"
                                />
                                {paymentForm.errors.amount && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {paymentForm.errors.amount}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold text-gray-500">
                                    {__('keywords.note')}
                                </label>
                                <textarea
                                    rows={3}
                                    value={paymentForm.data.note}
                                    onChange={(e) =>
                                        paymentForm.setData(
                                            'note',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-right text-sm focus:border-black focus:outline-none"
                                />
                                {paymentForm.errors.note && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {paymentForm.errors.note}
                                    </p>
                                )}
                            </div>

                            {paymentForm.errors.customer_id && (
                                <p className="text-xs text-red-500">
                                    {paymentForm.errors.customer_id}
                                </p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600"
                                >
                                    {__('keywords.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={paymentForm.processing}
                                    className="flex-1 rounded-xl bg-black py-2.5 text-sm font-bold text-white disabled:opacity-50"
                                >
                                    {paymentForm.processing
                                        ? __('keywords.processing')
                                        : __('keywords.pay')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

Index.layout = (page) => <MainLayout>{page}</MainLayout>;
