import React, { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Edit, Package, Tag, AlertCircle, TrendingUp, AlignRight } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';
import { usePermissions } from '@/hooks/usePermissions';
import ProductModal from '@/Components/ProductModal';

export default function Show({ product, categories }) {
    const { __ } = useTranslation();
    const { can } = usePermissions();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);


    const getStockStatus = () => {
        if (product.quantity <= 0) {
            return { label: 'نفذ من المخزون', color: 'bg-red-100 text-red-700 border-red-200' };
        }
        if (product.quantity <= product.min_quantity) {
            return { label: 'الكمية أوشكت على النفاذ', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
        }
        return { label: 'متوفر', color: 'bg-green-100 text-green-700 border-green-200' };
    };

    const stockStatus = getStockStatus();

    
    const profit = product.sale_price - product.purchase_price;
    const profitMargin = product.purchase_price > 0 ? ((profit / product.purchase_price) * 100).toFixed(1) : 100;

    return (
        <>
            <Head title={`بيانات المنتج - ${product.name}`} />

            <div className="relative mx-auto mb-8 max-w-5xl font-['Cairo']" dir="rtl">
                
                
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-2xl font-bold">
                        <Link 
                            href={route('products.index')} 
                            className="text-gray-500 hover:text-gray-800 transition-colors"
                        >
                            {__('keywords.products')}
                        </Link>
                        
                        <ChevronLeft size={22} className="text-gray-400 mt-1" strokeWidth={2.5} />
                        
                        <span className="text-gray-900">بيانات المنتج</span>
                        
                       
                        <span className={`text-xs px-3 py-1 rounded-full border ${stockStatus.color} font-bold mr-2 mt-1`}>
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

               
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    
                    
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
                            <Package size={24} />
                        </div>
                        <h3 className="text-gray-500 text-sm font-semibold mb-1">الكمية المتاحة</h3>
                        <p className="text-3xl font-bold text-gray-800">{product.quantity}</p>
                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <AlertCircle size={12} /> الحد الأدنى: {product.min_quantity}
                        </p>
                    </div>

                    
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-4">
                            <Tag size={24} />
                        </div>
                        <h3 className="text-gray-500 text-sm font-semibold mb-1">سعر البيع</h3>
                        <p className="text-3xl font-bold text-green-600">{product.sale_price} ج.م</p>
                        <p className="text-xs text-gray-400 mt-2 line-through">
                            سعر الشراء: {product.purchase_price} ج.م
                        </p>
                    </div>

                    
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="text-gray-500 text-sm font-semibold mb-1">هامش الربح (للقطعة)</h3>
                        <p className="text-3xl font-bold text-purple-600">{profit} ج.م</p>
                        <p className="text-xs text-purple-400 mt-2 font-bold">
                            نسبة الربح: {profitMargin}%
                        </p>
                    </div>

                </div>

               
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <AlignRight size={18} className="text-gray-500" />
                            البيانات الأساسية
                        </h2>
                    </div>
                    
                    <div className="p-6">
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            
                            <div className="flex flex-col border-b border-gray-50 pb-4">
                                <dt className="text-sm font-semibold text-gray-500 mb-1">{__('keywords.name')}</dt>
                                <dd className="text-base font-bold text-gray-900">{product.name}</dd>
                            </div>

                            <div className="flex flex-col border-b border-gray-50 pb-4">
                                <dt className="text-sm font-semibold text-gray-500 mb-1">{__('keywords.product_code')}</dt>
                                <dd className="text-base font-bold text-gray-900">{product.code || '—'}</dd>
                            </div>

                            <div className="flex flex-col border-b border-gray-50 pb-4">
                                <dt className="text-sm font-semibold text-gray-500 mb-1">{__('keywords.category')}</dt>
                                <dd className="text-base font-bold text-gray-900">
                                    {product.category?.name || 'بدون قسم'}
                                </dd>
                            </div>

                            <div className="flex flex-col border-b border-gray-50 pb-4">
                                <dt className="text-sm font-semibold text-gray-500 mb-1">تاريخ الإضافة</dt>
                                <dd className="text-base font-bold text-gray-900" dir="ltr">
                                    {new Date(product.created_at).toLocaleDateString('ar-EG')}
                                </dd>
                            </div>

                            <div className="flex flex-col md:col-span-2">
                                <dt className="text-sm font-semibold text-gray-500 mb-1">{__('keywords.description')}</dt>
                                <dd className="text-base font-medium text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl mt-1">
                                    {product.description || 'لا يوجد وصف مضاف لهذا المنتج.'}
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