import Button from '@/Components/Button';
import DeleteConfirmModal from '@/Components/DeleteConfirmModal';
import ProductModal from '@/Components/ProductModal';
import Table from '@/Components/Table';
import { usePermissions } from '@/hooks/usePermissions';
import useTranslation from '@/hooks/useTranslation';
import MainLayout from '@/Layouts/MainLayout';
import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Index({
    products = {},
    categories = [],
    filters = {},
}) {
    const { __ } = useTranslation();
    const { can } = usePermissions();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const delaySearch = setTimeout(() => {
            router.get(
                route('products.index'),
                { search: searchQuery, per_page: perPage },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 400);
        return () => clearTimeout(delaySearch);
    }, [searchQuery, perPage]);

    const handleDelete = (product) => {
        setProductToDelete(product);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setDeleteProcessing(true);
        router.delete(route('products.destroy', productToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModalOpen(false);
                setProductToDelete(null);
                setDeleteProcessing(false);
            },
            onError: () => setDeleteProcessing(false),
        });
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleView = (product) => {
        router.get(route('products.show', product.id));
    };

    const columns = [
        {
            header: __('keywords.product_code') || 'كود المنتج',
            accessor: 'code',
        },
        { header: __('keywords.name') || 'الاسم', accessor: 'name' },
        {
            header: __('keywords.category') || 'القسم',
            accessor: 'category',
            render: (row) => row.category?.name || '—',
        },
        { header: __('keywords.quantity') || 'الكمية', accessor: 'stock' },
        {
            header: __('keywords.min_quantity') || 'الحد الأدنى',
            accessor: 'min_stock',
        },
        {
            header: __('keywords.purchase_price') || 'سعر الشراء',
            accessor: 'purchase_price',
            render: (row) => `${row.purchase_price || 0} ج`,
        },
        {
            header: __('keywords.sale_price') || 'سعر البيع',
            accessor: 'sale_price',
            render: (row) => (
                <span className="font-bold text-green-700">
                    {row.sale_price || 0} ج
                </span>
            ),
        },
    ];

    return (
        <>
            <Head title={__('keywords.products')} />

            <div
                className="relative mx-auto mb-8 max-w-7xl font-['Cairo']"
                dir="rtl"
            >
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {__('keywords.products')}
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
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-200 py-2 pl-4 pr-10 text-right focus:border-black focus:outline-none"
                                />
                                <Search
                                    className="absolute right-3 top-2.5 text-gray-400"
                                    size={18}
                                />
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

                        {can('manage_products') && (
                            <Button
                                onClick={openAddModal}
                                className="whitespace-nowrap rounded-lg bg-[#1a202c] px-6 hover:bg-black"
                            >
                                {__('keywords.add')} {__('keywords.product')}
                            </Button>
                        )}
                    </div>

                    <Table
                        columns={columns}
                        data={products?.data || []}
                        pagination={products}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        canView={can('view_products')}
                        canEdit={can('manage_products')}
                        canDelete={can('manage_products')}
                    />
                </div>
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
                categories={categories}
            />

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setProductToDelete(null);
                }}
                onConfirm={confirmDelete}
                userName={productToDelete?.name}
                entityName={__('keywords.product')}
                processing={deleteProcessing}
            />
        </>
    );
}

Index.layout = (page) => <MainLayout>{page}</MainLayout>;
