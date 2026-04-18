import React, { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import Table from '@/Components/Table';
import Button from '@/Components/Button';
import UserModal from '@/Components/UserModal'; // استيراد النافذة المنبثقة
import { Search } from 'lucide-react';
import { Head } from '@inertiajs/react';

export default function UsersIndex({ users }) {
    // حالة التحكم في النافذة المنبثقة
    const [isModalOpen, setIsModalOpen] = useState(false);

    // بيانات الجدول
    const tableData = users?.data || [
        { id: 1, name: 'مينا ايهاب', role: 'مسئول مخزن', email: 'tes@test.com' },
        { id: 2, name: 'مينا ايهاب', role: 'مسئول مخزن', email: 'tes@test.com' },
        { id: 3, name: 'مينا ايهاب', role: 'مسئول مخزن', email: 'tes@test.com' },
    ];

    const columns = [
        { header: 'الاسم', accessor: 'name' },
        { header: 'الدور', accessor: 'role' },
        { header: 'البريد الالكتروني', accessor: 'email' },
    ];

    // دالة وهمية للتعامل مع الإرسال مؤقتاً
    const handleAddUser = () => {
        console.log('سيتم إضافة المستخدم هنا عبر Inertia');
        setIsModalOpen(false); // إغلاق النافذة بعد الإرسال
    };

    return (
        <MainLayout>
            <Head title="المستخدمين" />
            
            <div className="max-w-6xl mx-auto relative">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">المستخدمين</h1>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6 gap-4">
                        {/* زر فتح النافذة المنبثقة */}
                        

                        <div className="relative w-72">
                            <input
                                type="text"
                                placeholder="بحث"
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                        <Button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#1a202c] hover:bg-black rounded-lg px-6"
                        >
                            اضافة مستخدم
                        </Button>
                    </div>

                    <Table columns={columns} data={tableData} onEdit={()=>{}} onDelete={()=>{}} />
                </div>
            </div>

            {/* استخدام مكون النافذة المنبثقة وتمرير الـ Props له */}
            <UserModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleAddUser} 
            />

        </MainLayout>
    );
}