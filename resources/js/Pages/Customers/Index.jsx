import React, { useState, useEffect } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import Table from '@/Components/Table';
import Button from '@/Components/Button';
import CustomerModal from '@/Components/CustomerModal'; 
import { Search } from 'lucide-react';
import { Head, router } from '@inertiajs/react';

export default function Index({ customers = {}, filters = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // لوجيك البحث (Live Search)
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            router.get(route('customers.index'), 
                { search: searchQuery }, 
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 400);
        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    // دوال الحذف والتعديل والعرض
    const handleDelete = (customer) => {
        if (confirm(`هل أنت متأكد من حذف العميل "${customer.name}"؟`)) {
            router.delete(route('customers.destroy', customer.id), { preserveScroll: true });
        }
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

    // أعمدة الجدول (تم تعديل accessor الرقم القومي ليطابق الباك اند)
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
            
            <div className="max-w-6xl mx-auto relative">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">العملاء</h1>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6 gap-4">
                        
                        <div className="relative w-72">
                            <input
                                type="text"
                                placeholder="بحث"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black text-right"
                                dir="rtl"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>

                        <Button onClick={openAddModal} className="bg-[#1a202c] hover:bg-black rounded-lg px-6">
                            اضافة عميل
                        </Button>
                    </div>

                    {/* تمرير الداتا الحقيقية من الباك اند */}
                    <Table 
                        columns={columns} 
                        data={customers?.data || []} 
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
        </>
    );
}

Index.layout = (page) => <MainLayout>{page}</MainLayout>;