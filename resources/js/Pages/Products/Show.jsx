import ProductModal from '@/Components/ProductModal';
import { usePermissions } from '@/hooks/usePermissions';
import useTranslation from '@/hooks/useTranslation';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    AlignRight,
    ChevronLeft,
    Edit,
    Package,
    Tag,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

export default function Show({ product, categories }) {
    const { __ } = useTranslation();
    const { can } = usePermissions();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const getStockStatus = () => {
        if (product.quantity <= 0) {
            return {
                label: 'نفذ من المخزون',
                color: 'bg-red-100 text-red-700 border-red-200',
            };
        }
        if (product.quantity <= product.min_quantity) {
            return {
                label: 'الكمية أوشكت على النفاذ',
                color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            };
        }
        return {
            label: 'متوفر',
            color: 'bg-green-100 text-green-700 border-green-200',
        };
    };

    const stockStatus = getStockStatus();

    const profit = product.sale_price - product.purchase_price;
    const profitMargin =
        product.purchase_price > 0
            ? ((profit / product.purchase_price) * 100).toFixed(1)
            : 100;

    return (
        <>
            <Head title={`بيانات المنتج - ${product.name}`} />

            <div
                className="relative mx-auto mb-8 max-w-5xl font-['Cairo']"
                dir="rtl"
            >
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-2xl font-bold">
                        <Link
                            href={route('products.index')}
                            className="text-gray-500 transition-colors hover:text-gray-800"
                        >
                            {__('keywords.products')}
                        </Link>

                        <ChevronLeft
                            size={22}
                            className="mt-1 text-gray-400"
                            strokeWidth={2.5}
                        />

                        <span className="text-gray-900">بيانات المنتج</span>

                        <span
                            className={`rounded-full border px-3 py-1 text-xs ${stockStatus.color} mr-2 mt-1 font-bold`}
                        >
                            {stockStatus.label}
                        </span>
                    </div>

                    {can('manage_products') && (
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-[#1a202c] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-black"
                        >
                            <Edit size={16} />
                            {__('keywords.edit')}
                        </button>
                    )}
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <Package size={24} />
                        </div>
                        <h3 className="mb-1 text-sm font-semibold text-gray-500">
                            الكمية المتاحة
                        </h3>
                        <p className="text-3xl font-bold text-gray-800">
                            {product.quantity}
                        </p>
                        <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                            <AlertCircle size={12} /> الحد الأدنى:{' '}
                            {product.min_quantity}
                        </p>
                    </div>

                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                            <Tag size={24} />
                        </div>
                        <h3 className="mb-1 text-sm font-semibold text-gray-500">
                            سعر البيع
                        </h3>
                        <p className="text-3xl font-bold text-green-600">
                            {product.sale_price} ج.م
                        </p>
                        <p className="mt-2 text-xs text-gray-400 line-through">
                            سعر الشراء: {product.purchase_price} ج.م
                        </p>
                    </div>

                    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="mb-1 text-sm font-semibold text-gray-500">
                            هامش الربح (للقطعة)
                        </h3>
                        <p className="text-3xl font-bold text-purple-600">
                            {profit} ج.م
                        </p>
                        <p className="mt-2 text-xs font-bold text-purple-400">
                            نسبة الربح: {profitMargin}%
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                        <h2 className="flex items-center gap-2 font-bold text-gray-800">
                            <AlignRight size={18} className="text-gray-500" />
                            البيانات الأساسية
                        </h2>
                    </div>

                    <div className="p-6">
                        <dl className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                            <div className="flex flex-col border-b border-gray-50 pb-4">
                                <dt className="mb-1 text-sm font-semibold text-gray-500">
                                    {__('keywords.name')}
                                </dt>
                                <dd className="text-base font-bold text-gray-900">
                                    {product.name}
                                </dd>
                            </div>

                            <div className="flex flex-col border-b border-gray-50 pb-4">
                                <dt className="mb-1 text-sm font-semibold text-gray-500">
                                    {__('keywords.product_code')}
                                </dt>
                                <dd className="text-base font-bold text-gray-900">
                                    {product.code || '—'}
                                </dd>
                            </div>

                            <div className="flex flex-col border-b border-gray-50 pb-4">
                                <dt className="mb-1 text-sm font-semibold text-gray-500">
                                    {__('keywords.category')}
                                </dt>
                                <dd className="text-base font-bold text-gray-900">
                                    {product.category?.name || 'بدون قسم'}
                                </dd>
                            </div>

                            <div className="border-b border-gray-50 pb-4 text-right">
                                <dt className="mb-1 block text-sm font-semibold text-gray-500">
                                    تاريخ الإضافة
                                </dt>
                                <dd
                                    className="block text-base font-bold text-gray-900"
                                    dir="ltr"
                                >
                                    {new Date(
                                        product.created_at,
                                    ).toLocaleDateString('ar-EG')}
                                </dd>
                            </div>

                            <div className="flex flex-col md:col-span-2">
                                <dt className="mb-1 text-sm font-semibold text-gray-500">
                                    {__('keywords.description')}
                                </dt>
                                <dd className="mt-1 rounded-xl bg-gray-50 p-4 text-base font-medium leading-relaxed text-gray-700">
                                    {product.description ||
                                        'لا يوجد وصف مضاف لهذا المنتج.'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            <ProductModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                product={product}
                categories={categories}
            />
        </>
    );
}

Show.layout = (page) => <MainLayout>{page}</MainLayout>;
