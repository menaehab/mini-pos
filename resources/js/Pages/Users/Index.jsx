import React, { useState, useEffect } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import Table from '@/Components/Table';
import Button from '@/Components/Button';
import UserModal from '@/Components/UserModal'; 
import { Search } from 'lucide-react';
import { Head, router } from '@inertiajs/react';

export default function Index({ users = {}, filters = {} , permissions = [] }) { 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    
    const [selectedUser, setSelectedUser] = useState(null);

   
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            router.get(route('users.index'), 
                { search: searchQuery }, 
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 400);
        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    
    const handleDelete = (user) => {
       
        if (confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟`)) {
        
            router.delete(route('users.destroy', user.id), {
                preserveScroll: true,
                onSuccess: () => {
                   
                    console.log('تم الحذف بنجاح');
                }
            });
        }
    };

  
    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

   
    const openAddModal = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const columns = [
        { header: 'الاسم', accessor: 'name' },
        { header: 'الدور', accessor: 'role' },
        { header: 'البريد الالكتروني', accessor: 'email' },
    ];

    return (
        <>
            <Head title="المستخدمين" />
            
            <div className="max-w-6xl mx-auto relative">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">المستخدمين</h1>
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

                        
                        <Button 
                            onClick={openAddModal}
                            className="bg-[#1a202c] hover:bg-black rounded-lg px-6"
                        >
                            اضافة مستخدم
                        </Button>
                    </div>

                   
                    <Table 
                        columns={columns} 
                        data={users?.data || []} 
                        onEdit={handleEdit}    
                        onDelete={handleDelete} 
                    />
                </div>
            </div>

            
            <UserModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                user={selectedUser} 
                permissions={permissions}
            />
        </>
    );
}


Index.layout = page => <MainLayout>{page}</MainLayout>;