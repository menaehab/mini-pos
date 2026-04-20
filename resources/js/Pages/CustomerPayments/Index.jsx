import DeleteConfirmModal from '@/Components/DeleteConfirmModal';
import Table from '@/Components/Table';
import { usePermissions } from '@/hooks/usePermissions';
import useTranslation from '@/hooks/useTranslation';
import MainLayout from '@/Layouts/MainLayout';
import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Index({ payments = {}, filters = {} }) {
    const { __ } = useTranslation();
    const { can } = usePermissions();

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const delaySearch = setTimeout(() => {
            router.get(
                route('customer-payments.index'),
                { search: searchQuery, date_from: dateFrom },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 400);
        return () => clearTimeout(delaySearch);
    }, [searchQuery, dateFrom]);

    const handleDelete = (payment) => {
        setPaymentToDelete(payment);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setDeleteProcessing(true);
        router.delete(route('customer-payments.destroy', paymentToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setPaymentToDelete(null);
                setDeleteProcessing(false);
            },
            onError: () => setDeleteProcessing(false),
        });
    };

    const columns = [
        {
            header: 'العميل',
            accessor: 'customer',
            render: (row) => (
                <span className="text-gray-800">
                    {row.customer?.name || '—'}
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
            header: 'فاتورة البيع',
            accessor: 'allocations',
            render: (row) => {
                const invoices = row.allocations
                    ?.map((a) => a.sale?.number)
                    .filter(Boolean);
                return (
                    <span className="text-gray-600">
                        {invoices?.length > 0 ? invoices.join(' , ') : '—'}
                    </span>
                );
            },
        },
        {
            header: 'المبلغ',
            accessor: 'amount',
            render: (row) => (
                <span className="text-gray-600">{row.amount || 0} ج.م</span>
            ),
        },
    ];

    return (
        <>
            <Head title="اذن التوريد" />

            <div
                className="relative mx-auto mb-8 max-w-7xl font-['Cairo']"
                dir="rtl"
            >
                <div className="flex items-center justify-start mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        اذن التوريد
                    </h1>
                </div>

                <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl">
                    <div className="flex items-center w-full gap-4 mb-6">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="بحث"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-3 pl-4 pr-10 text-sm text-right transition-colors border border-gray-200 rounded-xl focus:border-black focus:outline-none"
                            />
                            <Search
                                className="absolute right-3 top-3.5 text-gray-400"
                                size={18}
                            />
                        </div>

                        <div className="relative w-64">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-4 py-3 text-sm text-gray-400 transition-colors border border-gray-200 cursor-pointer rounded-xl focus:border-black focus:outline-none"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <Table
                        columns={columns}
                        data={payments?.data || []}
                        pagination={payments}
                        onDelete={handleDelete}
                        canDelete={can('manage_customer_payments')}
                    />
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setPaymentToDelete(null);
                }}
                onConfirm={confirmDelete}
                userName={`مبلغ ${paymentToDelete?.amount} ج.م`}
                entityName="اذن التوريد"
                processing={deleteProcessing}
            />
        </>
    );
}

Index.layout = (page) => <MainLayout>{page}</MainLayout>;
