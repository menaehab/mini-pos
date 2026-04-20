import MainLayout from '@/Layouts/MainLayout';
import { Head, router } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';

export default function Dashboard({
    salesOverview,
    profitAndCost,
    products,
    customers,
    purchases,
    charts,
    filters,
}) {
    const handlePeriodChange = (e) => {
        router.get(
            route('dashboard'),
            { period: e.target.value },
            { preserveState: true },
        );
    };

    const totalSalesValue = profitAndCost?.total_revenue || 0;
    const totalPurchasesValue = purchases?.total_purchases || 0;
    const grandTotal = totalSalesValue + totalPurchasesValue;

    const salesPercentage =
        grandTotal > 0 ? Math.round((totalSalesValue / grandTotal) * 100) : 0;

    const performanceData = charts?.performance_last_7_days || [];
    const maxChartValue = Math.max(
        ...performanceData.map((d) => d.sales),
        ...performanceData.map((d) => d.purchases),
        1,
    );

    return (
        <>
            <Head title="الإحصائيات" />

            <div
                className="relative mx-auto mb-8 max-w-7xl font-['Cairo']"
                dir="rtl"
            >
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        الإحصائيات
                    </h1>

                    <div className="relative w-40">
                        <select
                            value={filters?.period || 'today'}
                            onChange={handlePeriodChange}
                            className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-right text-sm font-bold text-gray-700 focus:border-black focus:outline-none"
                        >
                            <option value="today">اليوم</option>
                            <option value="week">هذا الأسبوع</option>
                            <option value="month">هذا الشهر</option>
                        </select>
                        <ChevronDown
                            className="absolute text-gray-400 left-4 top-3"
                            size={16}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="flex flex-col items-center justify-center h-32 p-6 transition-shadow bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
                        <span className="mb-2 text-sm font-bold text-gray-600">
                            الإيرادات
                        </span>
                        <span className="text-3xl font-bold text-[#14b8a6]">
                            {(
                                profitAndCost?.total_revenue || 0
                            ).toLocaleString()}
                        </span>
                    </div>

                    <div className="flex flex-col items-center justify-center h-32 p-6 transition-shadow bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
                        <span className="mb-2 text-sm font-bold text-gray-600">
                            المصروفات (التكلفة)
                        </span>
                        <span className="text-3xl font-bold text-red-500">
                            {(profitAndCost?.total_cost || 0).toLocaleString()}
                        </span>
                    </div>

                    <div className="flex flex-col items-center justify-center h-32 p-6 transition-shadow bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
                        <span className="mb-2 text-sm font-bold text-gray-600">
                            عدد فواتير البيع
                        </span>
                        <span className="text-3xl font-bold text-gray-900">
                            {salesOverview?.invoices_count || 0}
                        </span>
                    </div>

                    <div className="flex flex-col items-center justify-center h-32 p-6 transition-shadow bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md">
                        <span className="mb-2 text-sm font-bold text-gray-600">
                            عدد فواتير الشراء
                        </span>
                        <span className="text-3xl font-bold text-gray-900">
                            {purchases?.purchases_count || 0}
                        </span>
                    </div>

                    <div className="flex flex-col items-center justify-center h-32 p-6 transition-shadow bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md lg:col-span-2">
                        <span className="mb-2 text-sm font-bold text-gray-600">
                            اجمالي العملاء
                        </span>
                        <span className="text-3xl font-bold text-gray-900">
                            {customers?.total_count || 0}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="flex flex-col items-center p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
                        <h3 className="w-full mb-8 text-lg font-bold text-right text-gray-800">
                            قيم الفواتير
                        </h3>

                        <div
                            className="relative flex items-center justify-center w-56 h-56 mb-8 transition-all duration-700 rounded-full"
                            style={{
                                background: `conic-gradient(#14b8a6 0% ${salesPercentage}%, #0ea5e9 ${salesPercentage}% 100%)`,
                            }}
                        >
                            <div className="absolute flex flex-col items-center justify-center bg-white rounded-full shadow-inner h-44 w-44">
                                <span className="mb-1 text-sm font-semibold text-gray-500">
                                    الإجمالي
                                </span>
                                <span className="text-xl font-bold text-gray-900">
                                    {grandTotal.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between w-full px-4 pt-4 border-t border-gray-50">
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full bg-[#14b8a6]"></span>
                                    <span className="text-sm font-bold text-gray-500">
                                        المبيعات
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-gray-400">
                                    {salesPercentage}%
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full bg-[#0ea5e9]"></span>
                                    <span className="text-sm font-bold text-gray-500">
                                        المشتريات
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-gray-400">
                                    {100 - salesPercentage}%
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col p-6 bg-white border border-gray-100 shadow-sm rounded-2xl lg:col-span-2">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center justify-between w-full text-left">
                                <div>
                                    <h3 className="mb-1 text-lg font-bold text-gray-800">
                                        أداء آخر 7 أيام
                                    </h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 rounded-full bg-[#14b8a6]"></span>
                                            <span className="text-xs font-bold text-gray-500">
                                                المبيعات
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                                            <span className="text-xs font-bold text-gray-500">
                                                المشتريات
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative mt-4 flex min-h-[200px] flex-1 items-end justify-between border-b border-gray-100 px-2 pb-6">
                            <div className="absolute w-full border-t border-gray-100 bottom-1/4"></div>
                            <div className="absolute w-full border-t border-gray-100 bottom-2/4"></div>
                            <div className="absolute w-full border-t border-gray-100 bottom-3/4"></div>
                            <div className="absolute w-full border-t border-gray-100 bottom-full"></div>

                            {performanceData.map((day, index) => {
                                const salesHeight =
                                    (day.sales / maxChartValue) * 100;
                                const purchasesHeight =
                                    (day.purchases / maxChartValue) * 100;

                                return (
                                    <div
                                        key={index}
                                        className="relative z-10 flex items-end justify-center w-12 h-full gap-1 group"
                                    >
                                        <div
                                            className="relative w-2.5 cursor-pointer rounded-t-sm bg-red-500 transition-all hover:bg-red-700"
                                            style={{
                                                height: `${purchasesHeight}%`,
                                                minHeight:
                                                    purchasesHeight > 0
                                                        ? '4px'
                                                        : '0',
                                            }}
                                        >
                                            <div className="absolute -left-4 -top-8 z-20 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100">
                                                {day.purchases} ج.م
                                            </div>
                                        </div>

                                        <div
                                            className="relative w-2.5 cursor-pointer rounded-t-sm bg-[#14b8a6] transition-all hover:bg-[#0f766e]"
                                            style={{
                                                height: `${salesHeight}%`,
                                                minHeight:
                                                    salesHeight > 0
                                                        ? '4px'
                                                        : '0',
                                            }}
                                        >
                                            <div className="absolute -left-4 -top-8 z-20 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100">
                                                {day.sales} ج.م
                                            </div>
                                        </div>

                                        <span className="absolute text-xs font-bold text-gray-500 -bottom-6">
                                            {day.label}
                                        </span>
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
