import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import Table from '@/Components/Table';
import Button from '@/Components/Button';
import CustomerModal from '@/Components/CustomerModal'; 
import DeleteConfirmModal from '@/Components/DeleteConfirmModal';
import useTranslation from '@/hooks/useTranslation';
import { Search } from 'lucide-react';
import { Head, router } from '@inertiajs/react';

export default function Index({ customers = {}, filters = {} }) {
    const { __ } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const delaySearch = setTimeout(() => {
            router.get(route('customers.index'), 
                { search: searchQuery, per_page: perPage }, 
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 400);
        return () => clearTimeout(delaySearch);
    }, [searchQuery, perPage]);

    const handleDelete = (customer) => {
        setCustomerToDelete(customer);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setDeleteProcessing(true);
        router.delete(route('customers.destroy', customerToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setCustomerToDelete(null);
                setDeleteProcessing(false);
            },
            onError: () => setDeleteProcessing(false),
        });
    };

    const handleEdit = (customer) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setSelectedCustomer(null);
        setIsModalOpen(true);
    };

    const handleView = (customer) => {
        router.get(route('customers.show', customer.id));
    };

    const columns = [
        { header: 'الاسم', accessor: 'name' },
        { header: 'رقم التليفون', accessor: 'phone' },
        { header: 'الرقم القومي', accessor: 'national_number' }, 
        { header: 'العنوان', accessor: 'address' },
        { 
            header: 'الرصيد', 
            accessor: 'balance',
            render: (row) => (
                <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold inline-block">
                    {row.balance || 0} جنيه
                </span>
            )
        },
    ];

    return (
        <>
            <Head title="العملاء" />
            
            <div className="max-w-6xl mx-auto relative mb-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">العملاء</h1>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex w-full items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative w-72">
                                    <input
                                        type="text"
                                        placeholder={__('keywords.search') || "بحث"}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-right focus:border-black focus:outline-none"
                                        dir="rtl"
                                    />
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                        {__('keywords.show')}
                                    </span>
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

                            <Button onClick={openAddModal} className="whitespace-nowrap rounded-lg bg-[#1a202c] px-6 hover:bg-black">
                                اضافة عميل
                            </Button>
                        </div>

                    <Table 
                        columns={columns} 
                        data={customers?.data || []} 
                        pagination={customers}
                        onView={handleView} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete} 
                    />
                </div>
            </div>

            <CustomerModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                customer={selectedCustomer} 
            />

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => { setDeleteModalOpen(false); setCustomerToDelete(null); }}
                onConfirm={confirmDelete}
                userName={customerToDelete?.name}
                entityName="العميل"
                processing={deleteProcessing}
            />
        </>
    );

}

Index.layout = (page) => <MainLayout>{page}</MainLayout>;