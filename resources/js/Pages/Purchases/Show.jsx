import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronLeft,
    CircleDollarSign,
    Package,
    Receipt,
    User,
} from 'lucide-react';

const Show = ({ purchase }) => {
    const items = purchase?.items || [];
    const paymentAllocations = purchase?.supplier_payment_allocations || [];

    const paidAmount = Number(
        purchase?.paid_amount ??
            paymentAllocations.reduce(
                (sum, allocation) =>
                    sum + Number(allocation?.supplier_payment?.amount || 0),
                0,
            ),
    );

    const totalAmount = Number(purchase?.total_price || 0);
    const remainingAmount = Number(
        purchase?.remaining_amount ?? Math.max(totalAmount - paidAmount, 0),
    );

    const statusLabel = remainingAmount <= 0 ? 'مسدد بالكامل' : 'غير مسدد';
    const statusClassName =
        remainingAmount <= 0
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-red-100 text-red-700 border-red-200';

    return (
        <>
            <Head title="تفاصيل فاتورة الشراء" />

            <div
                className="relative mx-auto mb-8 max-w-7xl font-['Cairo']"
                dir="rtl"
            >
                <div className="mb-8 flex items-center justify-start gap-2 text-right">
                    <Link
                        href={route('purchases.index')}
                        className="text-lg font-bold text-gray-500 transition-colors hover:text-black"
                    >
                        المشتريات
                    </Link>
                    <ChevronLeft size={20} className="mt-1 text-gray-400" />
                    <h1 className="text-xl font-bold text-gray-900">
                        تفاصيل الفاتورة #{purchase?.number || purchase?.id}
                    </h1>
                </div>

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                    <div className="flex flex-col gap-6 lg:col-span-1">
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center gap-2">
                                <Receipt size={18} className="text-gray-600" />
                                <h3 className="text-sm font-black text-gray-900">
                                    بيانات الفاتورة
                                </h3>
                            </div>

                            <div className="flex flex-col gap-3 text-sm font-semibold">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">
                                        رقم الفاتورة
                                    </span>
                                    <span className="text-gray-900">
                                        #{purchase?.number || purchase?.id}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">
                                        نوع الدفع
                                    </span>
                                    <span className="text-gray-900">
                                        {purchase?.payment_type === 'credit'
                                            ? 'آجل'
                                            : 'نقدي'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">
                                        الحالة
                                    </span>
                                    <span
                                        className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClassName}`}
                                    >
                                        {statusLabel}
                                    </span>
                                </div>
                                {purchase?.created_at && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">
                                            تاريخ الإنشاء
                                        </span>
                                        <span
                                            className="text-gray-900"
                                            dir="ltr"
                                        >
                                            {new Date(
                                                purchase.created_at,
                                            ).toLocaleDateString('ar-EG')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center gap-2">
                                <User size={18} className="text-gray-600" />
                                <h3 className="text-sm font-black text-gray-900">
                                    بيانات المورد
                                </h3>
                            </div>

                            <div className="flex flex-col gap-3 text-sm font-semibold">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">الاسم</span>
                                    <span className="text-gray-900">
                                        {purchase?.supplier?.name ||
                                            purchase?.supplier_name ||
                                            '—'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">
                                        الهاتف
                                    </span>
                                    <span className="text-gray-900" dir="ltr">
                                        {purchase?.supplier?.phone || '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center gap-2">
                                <CircleDollarSign
                                    size={18}
                                    className="text-gray-600"
                                />
                                <h3 className="text-sm font-black text-gray-900">
                                    ملخص الحساب
                                </h3>
                            </div>

                            <div className="flex flex-col gap-3 text-sm font-semibold">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">
                                        الإجمالي
                                    </span>
                                    <span className="text-gray-900">
                                        {totalAmount.toFixed(2)} ج.م
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">
                                        المدفوع
                                    </span>
                                    <span className="text-green-700">
                                        {paidAmount.toFixed(2)} ج.م
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                                    <span className="font-bold text-gray-800">
                                        المتبقي
                                    </span>
                                    <span className="font-black text-red-600">
                                        {remainingAmount.toFixed(2)} ج.م
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex min-h-[640px] flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                        <div>
                            <div className="mb-4 flex items-center gap-2">
                                <Package size={18} className="text-gray-600" />
                                <h3 className="text-sm font-black text-gray-900">
                                    الأصناف
                                </h3>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-gray-100">
                                <div className="custom-scrollbar overflow-x-auto">
                                    <table className="min-w-full text-right text-sm">
                                        <thead className="bg-gray-50 text-xs font-black text-gray-600">
                                            <tr>
                                                <th className="px-4 py-3">#</th>
                                                <th className="px-4 py-3">
                                                    المنتج
                                                </th>
                                                <th className="px-4 py-3">
                                                    الكمية
                                                </th>
                                                <th className="px-4 py-3">
                                                    سعر الشراء
                                                </th>
                                                <th className="px-4 py-3">
                                                    الإجمالي
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white font-semibold text-gray-700">
                                            {items.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-4 py-8 text-center text-gray-400"
                                                    >
                                                        لا توجد أصناف
                                                    </td>
                                                </tr>
                                            ) : (
                                                items.map((item, index) => (
                                                    <tr key={item.id || index}>
                                                        <td className="px-4 py-3">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-4 py-3 font-bold text-gray-900">
                                                            {item.item_name ||
                                                                item.product
                                                                    ?.name ||
                                                                '—'}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {Number(
                                                                item.purchase_price ||
                                                                    0,
                                                            ).toFixed(2)}{' '}
                                                            ج.م
                                                        </td>
                                                        <td className="px-4 py-3 font-bold text-black">
                                                            {(
                                                                Number(
                                                                    item.purchase_price ||
                                                                        0,
                                                                ) *
                                                                Number(
                                                                    item.quantity ||
                                                                        0,
                                                                )
                                                            ).toFixed(2)}{' '}
                                                            ج.م
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-center">
                                <div className="mb-1 text-xs font-bold text-gray-500">
                                    إجمالي الأصناف
                                </div>
                                <div className="text-sm font-black text-gray-900">
                                    {items.length}
                                </div>
                            </div>
                            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-center">
                                <div className="mb-1 text-xs font-bold text-gray-500">
                                    آخر تحديث
                                </div>
                                <div
                                    className="text-sm font-black text-gray-900"
                                    dir="ltr"
                                >
                                    {purchase?.updated_at
                                        ? new Date(
                                              purchase.updated_at,
                                          ).toLocaleDateString('ar-EG')
                                        : '—'}
                                </div>
                            </div>
                            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-center">
                                <div className="mb-1 text-xs font-bold text-gray-500">
                                    تاريخ الإنشاء
                                </div>
                                <div
                                    className="text-sm font-black text-gray-900"
                                    dir="ltr"
                                >
                                    {purchase?.created_at
                                        ? new Date(
                                              purchase.created_at,
                                          ).toLocaleDateString('ar-EG')
                                        : '—'}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto flex justify-end gap-3">
                            <Link
                                href={route('purchases.edit', purchase.id)}
                                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                تعديل الفاتورة
                            </Link>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="rounded-xl bg-black px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-800"
                            >
                                طباعة
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pointer-events-none absolute -left-10 top-20 opacity-10">
                    <CalendarDays size={120} className="text-gray-400" />
                </div>
            </div>
        </>
    );
};

Show.layout = (page) => <MainLayout>{page}</MainLayout>;

export default Show;
