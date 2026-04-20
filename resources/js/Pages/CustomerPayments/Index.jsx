import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import Table from '@/Components/Table';
import DeleteConfirmModal from '@/Components/DeleteConfirmModal';
import { Search } from 'lucide-react';
import { Head, router } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';
import { usePermissions } from '@/hooks/usePermissions';

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
                { preserveState: true, preserveScroll: true, replace: true }
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
            render: (row) => <span className="text-gray-800">{row.customer?.name || '—'}</span> 
        },
        { 
            header: 'المستخدم', 
            accessor: 'user',
            render: (row) => <span className="text-gray-600">{row.user?.name || '—'}</span> 
        },
        { 
            header: 'فاتورة البيع', 
            accessor: 'allocations',
            render: (row) => {
                const invoices = row.allocations?.map(a => a.sale?.invoice_number).filter(Boolean);
                return <span className="text-gray-600">{invoices?.length > 0 ? invoices.join(' , ') : '—'}</span>;
            }
        },
        { 
            header: 'وسيلة الدفع', 
            accessor: 'payment_method',
            render: (row) => <span className="text-gray-600">{row.payment_method || 'نقدي'}</span>
        },
        { 
            header: 'المبلغ', 
            accessor: 'amount',
            render: (row) => <span className="text-gray-600">{row.amount || 0} ج.م</span>
        },
    ];

    return (
        <>
            <Head title="اذن التوريد" />
            
            <div className="relative mx-auto mb-8 max-w-7xl font-['Cairo']" dir="rtl">
                
         
                <div className="mb-6 flex items-center justify-start">
                    <h1 className="text-2xl font-bold text-gray-800">
                        اذن التوريد
                    </h1>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    
                    <div className="mb-6 flex w-full items-center gap-4">
                        
            
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="بحث"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 py-3 pr-10 pl-4 text-right focus:border-black focus:outline-none text-sm transition-colors"
                            />
                            <Search className="absolute right-3 top-3.5 text-gray-400" size={18} />
                        </div>

                        <div className="relative w-64">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm text-gray-400 focus:border-black focus:outline-none cursor-pointer transition-colors"
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