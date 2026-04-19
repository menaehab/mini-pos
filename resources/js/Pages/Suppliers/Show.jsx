import React, { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function Show({ supplier }) {
    const { __ } = useTranslation();
    const [activeTab, setActiveTab] = useState('المشتريات');


    const tabs = [
        { id: 'المشتريات', label: 'المشتريات (0)' },
        { id: 'الدفعات', label: 'الدفعات (0)' },
        { id: 'مرتجع', label: 'مرتجع المشتريات (0)' },
    ];

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleString('ar-EG', { 
            year: 'numeric', month: '2-digit', day: '2-digit', 
            hour: '2-digit', minute:'2-digit' 
        });
    };

    return (
        <>
            <Head title={`بيانات ${__('keywords.supplier')} - ${supplier?.name}`} />
            
            <div className="max-w-7xl mx-auto relative font-['Cairo']" dir="rtl">
                
                <div className="flex items-center justify-start gap-2 mb-8 text-right">
                    <Link href={route('suppliers.index')} className="text-gray-500 hover:text-black font-bold text-lg transition-colors">
                        {__('keywords.suppliers')}
                    </Link>
                    <ChevronLeft size={20} className="text-gray-400 mt-1" />
                    <h1 className="text-xl font-bold text-gray-900">بيانات {__('keywords.supplier')}</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-md font-bold text-gray-900 mb-6">{__('keywords.supplier')}</h3>
                            
                            <div className="flex flex-col gap-4 text-sm font-semibold">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">{__('keywords.name')}</span>
                                    <span className="text-gray-900">{supplier?.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">رقم الهاتف</span>
                                    <span className="text-gray-900">{supplier?.phone || '—'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">تاريخ الإنشاء</span>
                                    <span className="text-gray-900" dir="ltr">{formatDate(supplier?.created_at)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-md font-bold text-gray-900 mb-6">رصيد {__('keywords.supplier')}</h3>
                            
                            <div className="flex flex-col gap-4 text-sm font-semibold">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">اجمالي المشتريات</span>
                                    <span className="text-gray-900">100 جنيه</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">اجمالي الدفعات</span>
                                    <span className="text-gray-900">100- جنيه</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">اجمالي المرتجعات بدون نقدي</span>
                                    <span className="text-gray-900">100- جنيه</span>
                                </div>
                                
                                <hr className="border-gray-200 my-1" />
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-800 font-bold">الرصيد</span>
                                    <span className="text-gray-900 font-bold">300- جنيه</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[450px] flex flex-col">
                        
                        <div className="flex items-center gap-2 border-b border-gray-200 pb-4 mb-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                                        activeTab === tab.id 
                                        ? 'bg-black text-white shadow-md' 
                                        : 'text-gray-500 hover:text-black hover:bg-gray-50'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-gray-400 font-medium text-sm">
                                {activeTab === 'المشتريات' && 'لم يتم العثور على فواتير شراء'}
                                {activeTab === 'الدفعات' && 'لم يتم العثور على دفعات مسجلة'}
                                {activeTab === 'مرتجع' && 'لم يتم العثور على مرتجعات'}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = (page) => <MainLayout>{page}</MainLayout>;