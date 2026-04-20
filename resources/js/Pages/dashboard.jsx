import React from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, router } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';

export default function Dashboard({ salesOverview, profitAndCost, products, customers, purchases, charts, filters }) {
    

    const handlePeriodChange = (e) => {
        router.get(route('dashboard'), { period: e.target.value }, { preserveState: true });
    };


    const totalSalesValue = profitAndCost?.total_revenue || 0;
    const totalPurchasesValue = purchases?.total_purchases || 0;
    const grandTotal = totalSalesValue + totalPurchasesValue;
    

    const salesPercentage = grandTotal > 0 ? Math.round((totalSalesValue / grandTotal) * 100) : 0;

    const performanceData = charts?.performance_last_7_days || [];
    const maxChartValue = Math.max(
        ...performanceData.map(d => d.sales), 
        ...performanceData.map(d => d.purchases), 
        1
    );

    return (
        <>
            <Head title="الإحصائيات" />
            
            <div className="relative mx-auto mb-8 max-w-7xl font-['Cairo']" dir="rtl">
                
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">الإحصائيات</h1>
                    
                    <div className="relative w-40">
                        <select 
                            value={filters?.period || 'today'}
                            onChange={handlePeriodChange}
                            className="w-full appearance-none rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-right text-sm font-bold text-gray-700 focus:border-black focus:outline-none cursor-pointer"
                        >
                            <option value="today">اليوم</option>
                            <option value="week">هذا الأسبوع</option>
                            <option value="month">هذا الشهر</option>
                        </select>
                        <ChevronDown className="absolute left-4 top-3 text-gray-400" size={16} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center h-32 hover:shadow-md transition-shadow">
                        <span className="text-sm font-bold text-gray-600 mb-2">الإيرادات</span>
                        <span className="text-3xl font-bold text-[#14b8a6]">
                            {(profitAndCost?.total_revenue || 0).toLocaleString()}
                        </span>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center h-32 hover:shadow-md transition-shadow">
                        <span className="text-sm font-bold text-gray-600 mb-2">المصروفات (التكلفة)</span>
                        <span className="text-3xl font-bold text-red-500">
                            {(profitAndCost?.total_cost || 0).toLocaleString()}
                        </span>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center h-32 hover:shadow-md transition-shadow">
                        <span className="text-sm font-bold text-gray-600 mb-2">عدد فواتير البيع</span>
                        <span className="text-3xl font-bold text-gray-900">
                            {salesOverview?.invoices_count || 0}
                        </span>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center h-32 hover:shadow-md transition-shadow">
                        <span className="text-sm font-bold text-gray-600 mb-2">عدد فواتير الشراء</span>
                        <span className="text-3xl font-bold text-gray-900">
                            {purchases?.purchases_count || 0}
                        </span>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center items-center h-32 hover:shadow-md transition-shadow lg:col-span-2">
                        <span className="text-sm font-bold text-gray-600 mb-2">اجمالي العملاء</span>
                        <span className="text-3xl font-bold text-gray-900">
                            {customers?.total_count || 0}
                        </span>
                    </div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center">
                        <h3 className="font-bold text-gray-800 text-lg mb-8 w-full text-right">قيم الفواتير</h3>
                        
                        <div className="relative w-56 h-56 rounded-full flex items-center justify-center mb-8 transition-all duration-700" 
                             style={{ background: `conic-gradient(#14b8a6 0% ${salesPercentage}%, #0ea5e9 ${salesPercentage}% 100%)` }}>
                            <div className="absolute w-44 h-44 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                                <span className="text-gray-500 text-sm font-semibold mb-1">الإجمالي</span>
                                <span className="text-xl font-bold text-gray-900">{grandTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex justify-between w-full px-4 border-t border-gray-50 pt-4">
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-[#14b8a6]"></span>
                                    <span className="text-sm font-bold text-gray-500">المبيعات</span>
                                </div>
                                <span className="text-xs font-bold text-gray-400">{salesPercentage}%</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-[#0ea5e9]"></span>
                                    <span className="text-sm font-bold text-gray-500">المشتريات</span>
                                </div>
                                <span className="text-xs font-bold text-gray-400">{100 - salesPercentage}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-2 flex flex-col">
                        
                        <div className="flex justify-between items-start mb-8">
                            <div className="text-left w-full flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg mb-1">أداء آخر 7 أيام</h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]"></span>
                                            <span className="text-xs font-bold text-gray-500">المبيعات</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                            <span className="text-xs font-bold text-gray-500">المشتريات</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 relative mt-4 min-h-[200px] flex items-end justify-between px-2 pb-6 border-b border-gray-100">
                            <div className="absolute w-full border-t border-gray-100 bottom-1/4"></div>
                            <div className="absolute w-full border-t border-gray-100 bottom-2/4"></div>
                            <div className="absolute w-full border-t border-gray-100 bottom-3/4"></div>
                            <div className="absolute w-full border-t border-gray-100 bottom-full"></div>
                            
                            {performanceData.map((day, index) => {
                                const salesHeight = (day.sales / maxChartValue) * 100;
                                const purchasesHeight = (day.purchases / maxChartValue) * 100;

                                return (
                                    <div key={index} className="relative flex justify-center items-end h-full w-12 z-10 gap-1 group">
                                        
                                        <div className="w-2.5 bg-red-500 rounded-t-sm hover:bg-red-700 transition-all cursor-pointer relative" style={{ height: `${purchasesHeight}%`, minHeight: purchasesHeight > 0 ? '4px' : '0' }}>
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 -left-4 bg-black text-white text-[10px] py-1 px-2 rounded font-bold whitespace-nowrap z-20">
                                                {day.purchases} ج.م
                                            </div>
                                        </div>

                                        <div className="w-2.5 bg-[#14b8a6] rounded-t-sm hover:bg-[#0f766e] transition-all cursor-pointer relative" style={{ height: `${salesHeight}%`, minHeight: salesHeight > 0 ? '4px' : '0' }}>
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 -left-4 bg-black text-white text-[10px] py-1 px-2 rounded font-bold whitespace-nowrap z-20">
                                                {day.sales} ج.م
                                            </div>
                                        </div>

                                        <span className="absolute -bottom-6 text-xs font-bold text-gray-500">{day.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                    </div>

                </div>

            </div>
        </>
    );
}

Dashboard.layout = (page) => <MainLayout>{page}</MainLayout>;