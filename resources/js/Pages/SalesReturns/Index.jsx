import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import Table from '@/Components/Table';
import DeleteConfirmModal from '@/Components/DeleteConfirmModal';
import { Search, RotateCcw } from 'lucide-react'; // استخدمنا أيقونة الإرجاع
import { Head, router } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';
import { usePermissions } from '@/hooks/usePermissions';

export default function Index({ returns = {}, filters = {} }) {
    const { __ } = useTranslation();
    const { can } = usePermissions();
    
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');
    
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [returnToDelete, setReturnToDelete] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const delaySearch = setTimeout(() => {
            router.get(
                route('sales-returns.index'), // تأكد إن ده اسم الراوت بتاعك
                { search: searchQuery, per_page: perPage }, 
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 400);
        return () => clearTimeout(delaySearch);
    }, [searchQuery, perPage]);

    const handleDelete = (item) => {
        setReturnToDelete(item);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setDeleteProcessing(true);
        router.delete(route('sales-returns.destroy', returnToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setReturnToDelete(null);
                setDeleteProcessing(false);
            },
            onError: () => setDeleteProcessing(false),
        });
    };

    const handleEdit = (item) => {
        router.get(route('sales-returns.edit', item.id));
    };

    const handleView = (item) => {
        router.get(route('sales-returns.show', item.id));
    };

    // تعريف الأعمدة لجدول المرتجعات
    const columns = [
        { header: __('keywords.return_number'), accessor: 'return_number' },
        { 
            header: __('keywords.original_invoice'), 
            accessor: 'sale',
            render: (row) => <span className="font-bold text-gray-600">{row.sale?.invoice_number || '—'}</span> 
        },
        { 
            header: __('keywords.customer'), 
            accessor: 'customer',
            render: (row) => <span className="font-bold text-gray-800">{row.customer?.name || __('keywords.cash_customer')}</span> 
        },
        { 
            header: __('keywords.total_returned'), 
            accessor: 'total_returned',
            render: (row) => <span className="font-bold text-red-600">{row.total_returned || 0} ج.م</span>
        },
        { 
            header: __('keywords.status'), 
            accessor: 'status',
            render: (row) => {
                let badgeClass = "bg-gray-100 text-gray-700 border-gray-200";
                let statusText = row.status;

                // حالات المرتجع (مكتمل أو قيد الانتظار)
                if (row.status === 'completed') {
                    badgeClass = "bg-green-100 text-green-700 border-green-200";
                    statusText = __('keywords.completed_status');
                } else if (row.status === 'pending') {
                    badgeClass = "bg-yellow-100 text-yellow-700 border-yellow-200";
                    statusText = __('keywords.pending_status');
                }

                return (
                    <span className={`px-3 py-1 rounded-full border text-xs font-bold ${badgeClass}`}>
                        {statusText}
                    </span>
                );
            }
        },
        { 
            header: __('keywords.return_date'), 
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
            <Head title={__('keywords.sales_returns')} />
            
            <div className="relative mx-auto mb-8 max-w-7xl font-['Cairo']" dir="rtl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {__('keywords.sales_returns')}
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
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 py-2 pr-10 pl-4 text-right focus:border-black focus:outline-none"
                                />
                                <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">{__('keywords.show')}</span>
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

                        {can('manage_sales_returns') && (
                            <button 
                                onClick={() => router.get(route('sales-returns.create'))} 
                                className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-700 min-w-[130px] transition-colors shadow-md"
                            >
                                <RotateCcw size={16} />
                                {__('keywords.add_return')}
                            </button>
                        )}
                    </div>

                    <Table 
                        columns={columns} 
                        data={returns?.data || []} 
                        pagination={returns}
                        onView={handleView} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete} 
                        canView={can('view_sales_returns')}
                        canEdit={can('manage_sales_returns')}
                        canDelete={can('manage_sales_returns')}
                    />
                </div>
            </div>

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setReturnToDelete(null);
                }}
                onConfirm={confirmDelete}
                userName={returnToDelete?.return_number}
                entityName={__('keywords.return_number')}
                processing={deleteProcessing}
            />
        </>
    );
}

Index.layout = (page) => <MainLayout>{page}</MainLayout>;