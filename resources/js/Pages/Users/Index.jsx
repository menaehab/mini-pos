import Button from '@/Components/Button';
import DeleteConfirmModal from '@/Components/DeleteConfirmModal';
import Table from '@/Components/Table';
import UserModal from '@/Components/UserModal';
import MainLayout from '@/Layouts/MainLayout';
import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Index({ users = {}, filters = {}, permissions = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');

    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const delaySearch = setTimeout(() => {
            router.get(
                route('users.index'),
                { search: searchQuery, per_page: perPage },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 400);

        return () => clearTimeout(delaySearch);
    }, [searchQuery, perPage]);

    const handleDelete = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setDeleteProcessing(true);
        router.delete(route('users.destroy', userToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setUserToDelete(null);
                setDeleteProcessing(false);
            },
            onError: () => setDeleteProcessing(false),
        });
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

            <div className="relative mx-auto max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">
                        المستخدمين
                    </h1>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <div className="flex w-full items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative w-72">
                                    <input
                                        type="text"
                                        placeholder="بحث"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-right focus:border-black focus:outline-none"
                                        dir="rtl"
                                    />
                                    <Search
                                        className="absolute left-3 top-2.5 text-gray-400"
                                        size={18}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                        عرض
                                    </span>
                                    <select
                                        value={perPage}
                                        onChange={(e) =>
                                            setPerPage(e.target.value)
                                        }
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

                            <Button
                                onClick={openAddModal}
                                className="whitespace-nowrap rounded-lg bg-[#1a202c] px-6 hover:bg-black"
                            >
                                اضافة مستخدم
                            </Button>
                        </div>
                    </div>

                    <Table
                        columns={columns}
                        data={users?.data || []}
                        pagination={users}
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

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setUserToDelete(null);
                }}
                onConfirm={confirmDelete}
                userName={userToDelete?.name}
                processing={deleteProcessing}
            />
        </>
    );
}

Index.layout = (page) => <MainLayout>{page}</MainLayout>;
