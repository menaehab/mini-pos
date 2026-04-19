import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import Table from '@/Components/Table';
import Button from '@/Components/Button';
import SupplierModal from '@/Components/SupplierModal'; 
import DeleteConfirmModal from '@/Components/DeleteConfirmModal';
import { Search } from 'lucide-react';
import { Head, router } from '@inertiajs/react';
import useTranslation from '@/hooks/useTranslation';
import { usePermissions } from '@/hooks/usePermissions';

export default function Index({ suppliers = {}, filters = {} }) {
    const { __ } = useTranslation();
    const { can } = usePermissions();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const delaySearch = setTimeout(() => {
            router.get(
                route('suppliers.index'), 
                { search: searchQuery, per_page: perPage }, 
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 400);
        return () => clearTimeout(delaySearch);
    }, [searchQuery, perPage]);

    const handleDelete = (supplier) => {
        setSupplierToDelete(supplier);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setDeleteProcessing(true);
        router.delete(route('suppliers.destroy', supplierToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSupplierToDelete(null);
                setDeleteProcessing(false);
            },
            onError: () => setDeleteProcessing(false),
        });
    };

    const handleEdit = (supplier) => {
        setSelectedSupplier(supplier);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setSelectedSupplier(null);
        setIsModalOpen(true);
    };

    const handleView = (supplier) => {
        router.get(route('suppliers.show', supplier.id));
    };

    const columns = [
        { header: __('keywords.name'), accessor: 'name' },
        { header: 'رقم التليفون', accessor: 'phone' },
        { 
            header: 'الرصيد', 
            accessor: 'balance',
            render: (row) => (
                <span className="inline-block rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
                    {row.balance || 0} جنيه
                </span>
            )
        },
    ];

    return (
        <>
            <Head title={__('keywords.suppliers')} />
            <div className="relative mx-auto mb-8 max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {__('keywords.suppliers')}
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
                                    className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-right focus:border-black focus:outline-none"
                                    dir="rtl"
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">عرض</span>
                                <select
                                    value={perPage}
                                    onChange={(e) => setPerPage(e.target.value)}
                                    className="cursor-pointer appearance-none rounded-lg border border-gray-200 bg-none px-2 py-2 text-center focus:border-black focus:outline-none"
                                    style={{ backgroundImage: 'none' }}
                                    dir="ltr"
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                        </div>

                        {can('manage_suppliers') && (
                            <Button onClick={openAddModal} className="whitespace-nowrap rounded-lg bg-[#1a202c] px-6 hover:bg-black">
                                {__('keywords.add')} {__('keywords.supplier')}
                            </Button>
                        )}
                    </div>

                    <Table 
                        columns={columns} 
                        data={suppliers?.data || []} 
                        pagination={suppliers}
                        onView={handleView} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete} 
                        canView={can('view_suppliers')}
                        canEdit={can('manage_suppliers')}
                        canDelete={can('manage_suppliers')}
                    />
                </div>
            </div>

            <SupplierModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} supplier={selectedSupplier} />

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setSupplierToDelete(null);
                }}
                onConfirm={confirmDelete}
                userName={supplierToDelete?.name}
                entityName={__('keywords.supplier')}
                processing={deleteProcessing}
            />
        </>
    );
}

Index.layout = (page) => <MainLayout>{page}</MainLayout>;