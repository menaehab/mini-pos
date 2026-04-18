import Button from '@/Components/Button';
import Table from '@/Components/Table';
import UserModal from '@/Components/UserModal'; // استيراد النافذة المنبثقة
import MainLayout from '@/Layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

export default function UsersIndex({ users }) {
    // حالة التحكم في النافذة المنبثقة
    const [isModalOpen, setIsModalOpen] = useState(false);

    // بيانات الجدول
    const tableData = users?.data || [
        {
            id: 1,
            name: 'مينا ايهاب',
            role: 'مسئول مخزن',
            email: 'tes@test.com',
        },
        {
            id: 2,
            name: 'مينا ايهاب',
            role: 'مسئول مخزن',
            email: 'tes@test.com',
        },
        {
            id: 3,
            name: 'مينا ايهاب',
            role: 'مسئول مخزن',
            email: 'tes@test.com',
        },
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
        <>
            <Head title="المستخدمين" />

            <div className="relative mx-auto max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">
                        المستخدمين
                    </h1>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between gap-4">
                        {/* زر فتح النافذة المنبثقة */}

                        <div className="relative w-72">
                            <input
                                type="text"
                                placeholder="بحث"
                                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 focus:border-black focus:outline-none"
                            />
                            <Search
                                className="absolute left-3 top-2.5 text-gray-400"
                                size={18}
                            />
                        </div>
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="rounded-lg bg-[#1a202c] px-6 hover:bg-black"
                        >
                            اضافة مستخدم
                        </Button>
                    </div>

                    <Table
                        columns={columns}
                        data={tableData}
                        onEdit={() => {}}
                        onDelete={() => {}}
                    />
                </div>
            </div>

            {/* استخدام مكون النافذة المنبثقة وتمرير الـ Props له */}
            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddUser}
            />
        </>
    );
}

Index.layout = (page) => <MainLayout children={page} />;
