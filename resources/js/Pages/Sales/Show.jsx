import useTranslation from '@/hooks/useTranslation';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    ChevronLeft,
    CircleDollarSign,
    FileText,
    Package,
    Receipt,
    User,
} from 'lucide-react';

// data: sale{id, total_price, note, type, customer_name, installment_months, installment_amount, installment_rate, customer_id, user_id, customer{id, name, phone, address, national_number}, items[{id, product_name, sale_price, purchase_price, quantity, product_id, sale_id}], payment_allocations[{id, is_first_payment, customer_payment_id, sale_id, customer_payment{id, amount, note, customer_id, user_id}}]}
export default function Show({ sale }) {
    const { __ } = useTranslation();

    const items = sale?.items || [];
    const paymentAllocations = sale?.payment_allocations || [];

    const subtotal = items.reduce(
        (sum, item) =>
            sum + Number(item.sale_price || 0) * Number(item.quantity || 0),
        0,
    );

    const paidAmount = paymentAllocations.reduce(
        (sum, allocation) =>
            sum + Number(allocation?.customer_payment?.amount || 0),
        0,
    );

    const totalAmount = Number(sale?.total_price || subtotal);
    const remainingAmount = Math.max(totalAmount - paidAmount, 0);

    const isInstallment = sale?.type === 'installment';

    const saleStatus =
        remainingAmount <= 0
            ? __('keywords.paid_status') || 'مدفوع'
            : paidAmount > 0
              ? __('keywords.partial_status') || 'مدفوع جزئيا'
              : __('keywords.unpaid_status') || 'غير مدفوع';

    const statusClassName =
        remainingAmount <= 0
            ? 'bg-green-100 text-green-700 border-green-200'
            : paidAmount > 0
              ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
              : 'bg-red-100 text-red-700 border-red-200';

    return (
        <>
            <Head
                title={`${__('keywords.sale') || 'فاتورة بيع'} #${sale?.number || sale?.id}`}
            />

            <div
                className="relative mx-auto mb-8 max-w-7xl font-['Cairo']"
                dir="rtl"
            >
                <div className="mb-8 flex items-center justify-start gap-2 text-right">
                    <Link
                        href={route('sales.index')}
                        className="text-lg font-bold text-gray-500 transition-colors hover:text-black"
                    >
                        {__('keywords.sales') || 'المبيعات'}
                    </Link>
                    <ChevronLeft size={20} className="mt-1 text-gray-400" />
                    <h1 className="text-xl font-bold text-gray-900">
                        {__('keywords.sale_details') || 'تفاصيل الفاتورة'}
                    </h1>
                </div>

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                    <div className="flex flex-col gap-6 lg:col-span-1">
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center gap-2">
                                <Receipt size={18} className="text-gray-600" />
                                <h3 className="text-sm font-black text-gray-900">
                                    {__('keywords.sale') || 'الفاتورة'}
                                </h3>
                            </div>

                            <div className="flex flex-col gap-3 text-sm font-semibold">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">
                                        {__('keywords.invoice_number') ||
                                            'رقم الفاتورة'}
                                    </span>
                                    <span className="text-gray-900">
                                        #{sale?.number || sale?.id}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">
                                        {__('keywords.payment_type') ||
                                            'نوع الدفع'}
                                    </span>
                                    <span className="text-gray-900">
                                        {isInstallment
                                            ? __('keywords.installment') ||
                                              'آجل'
                                            : __('keywords.cash') || 'كاش'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">
                                        {__('keywords.status') || 'الحالة'}
                                    </span>
                                    <span
                                        className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClassName}`}
                                    >
                                        {saleStatus}
                                    </span>
                                </div>
                                {sale?.created_at && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">
                                            {__('keywords.created_date') ||
                                                'تاريخ الإنشاء'}
                                        </span>
                                        <span
                                            className="text-gray-900"
                                            dir="ltr"
                                        >
                                            {new Date(
                                                sale.created_at,
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
                                    {__('keywords.customer') || 'العميل'}
                                </h3>
                            </div>

                            <div className="flex flex-col gap-3 text-sm font-semibold">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">
                                        {__('keywords.name') || 'الاسم'}
                                    </span>
                                    <span className="text-gray-900">
                                        {sale?.customer?.name ||
                                            sale?.customer_name ||
                                            '—'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">
                                        {__('keywords.phone') || 'الهاتف'}
                                    </span>
                                    <span className="text-gray-900" dir="ltr">
                                        {sale?.customer?.phone || '—'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">
                                        {__('keywords.address') || 'العنوان'}
                                    </span>
                                    <span className="line-clamp-1 max-w-[60%] text-left text-gray-900">
                                        {sale?.customer?.address || '—'}
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
                                    {__('keywords.payment_summary') ||
                                        'ملخص الحساب'}
                                </h3>
                            </div>

                            <div className="flex flex-col gap-3 text-sm font-semibold">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">
                                        {__('keywords.total') || 'الإجمالي'}
                                    </span>
                                    <span className="text-gray-900">
                                        {totalAmount.toFixed(2)} ج.م
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">
                                        {__('keywords.paid') || 'المدفوع'}
                                    </span>
                                    <span className="text-green-700">
                                        {paidAmount.toFixed(2)} ج.م
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                                    <span className="font-bold text-gray-800">
                                        {__('keywords.remaining') || 'المتبقي'}
                                    </span>
                                    <span className="font-black text-red-600">
                                        {remainingAmount.toFixed(2)} ج.م
                                    </span>
                                </div>
                            </div>

                            {isInstallment && (
                                <div className="mt-4 space-y-2 rounded-xl bg-gray-50 p-4 text-xs font-bold text-gray-600">
                                    <div className="flex items-center justify-between">
                                        <span>
                                            {__(
                                                'keywords.installment_months',
                                            ) || 'عدد الأشهر'}
                                        </span>
                                        <span>
                                            {sale?.installment_months || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>
                                            {__('keywords.interest_rate') ||
                                                'الفائدة'}{' '}
                                            (%)
                                        </span>
                                        <span>
                                            {Number(
                                                sale?.installment_rate || 0,
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>
                                            {__(
                                                'keywords.monthly_installment',
                                            ) || 'القسط الشهري'}
                                        </span>
                                        <span>
                                            {Number(
                                                sale?.installment_amount || 0,
                                            ).toFixed(2)}{' '}
                                            ج.م
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex min-h-[640px] flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                        <div>
                            <div className="mb-4 flex items-center gap-2">
                                <Package size={18} className="text-gray-600" />
                                <h3 className="text-sm font-black text-gray-900">
                                    {__('keywords.products') || 'الأصناف'}
                                </h3>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-gray-100">
                                <div className="custom-scrollbar overflow-x-auto">
                                    <table className="min-w-full text-right text-sm">
                                        <thead className="bg-gray-50 text-xs font-black text-gray-600">
                                            <tr>
                                                <th className="px-4 py-3">#</th>
                                                <th className="px-4 py-3">
                                                    {__('keywords.product') ||
                                                        'المنتج'}
                                                </th>
                                                <th className="px-4 py-3">
                                                    {__('keywords.quantity') ||
                                                        'الكمية'}
                                                </th>
                                                <th className="px-4 py-3">
                                                    {__(
                                                        'keywords.sale_price',
                                                    ) || 'سعر البيع'}
                                                </th>
                                                <th className="px-4 py-3">
                                                    {__('keywords.total') ||
                                                        'الإجمالي'}
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
                                                        {__(
                                                            'keywords.no_data',
                                                        ) || 'لا توجد أصناف'}
                                                    </td>
                                                </tr>
                                            ) : (
                                                items.map((item, index) => (
                                                    <tr key={item.id || index}>
                                                        <td className="px-4 py-3">
                                                            {index + 1}
                                                        </td>
                                                        <td className="px-4 py-3 font-bold text-gray-900">
                                                            {item.product_name}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {Number(
                                                                item.sale_price ||
                                                                    0,
                                                            ).toFixed(2)}{' '}
                                                            ج.م
                                                        </td>
                                                        <td className="px-4 py-3 font-bold text-black">
                                                            {(
                                                                Number(
                                                                    item.sale_price ||
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

                        <div>
                            <div className="mb-4 flex items-center gap-2">
                                <CalendarDays
                                    size={18}
                                    className="text-gray-600"
                                />
                                <h3 className="text-sm font-black text-gray-900">
                                    {__('keywords.payments') || 'الدفعات'}
                                </h3>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-gray-100">
                                <div className="custom-scrollbar overflow-x-auto">
                                    <table className="min-w-full text-right text-sm">
                                        <thead className="bg-gray-50 text-xs font-black text-gray-600">
                                            <tr>
                                                <th className="px-4 py-3">#</th>
                                                <th className="px-4 py-3">
                                                    {__(
                                                        'keywords.amount_paid',
                                                    ) || 'المبلغ'}
                                                </th>
                                                <th className="px-4 py-3">
                                                    {__('keywords.note') ||
                                                        'ملاحظة'}
                                                </th>
                                                <th className="px-4 py-3">
                                                    {__('keywords.type') ||
                                                        'النوع'}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white font-semibold text-gray-700">
                                            {paymentAllocations.length === 0 ? (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="px-4 py-8 text-center text-gray-400"
                                                    >
                                                        {__(
                                                            'keywords.no_payments_found',
                                                        ) ||
                                                            'لا توجد دفعات مسجلة'}
                                                    </td>
                                                </tr>
                                            ) : (
                                                paymentAllocations.map(
                                                    (allocation, index) => (
                                                        <tr
                                                            key={
                                                                allocation.id ||
                                                                index
                                                            }
                                                        >
                                                            <td className="px-4 py-3">
                                                                {index + 1}
                                                            </td>
                                                            <td className="px-4 py-3 font-bold text-green-700">
                                                                {Number(
                                                                    allocation
                                                                        ?.customer_payment
                                                                        ?.amount ||
                                                                        0,
                                                                ).toFixed(
                                                                    2,
                                                                )}{' '}
                                                                ج.م
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-600">
                                                                {allocation
                                                                    ?.customer_payment
                                                                    ?.note ||
                                                                    '—'}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {allocation?.is_first_payment
                                                                    ? __(
                                                                          'keywords.first_payment',
                                                                      ) ||
                                                                      'دفعة أولى'
                                                                    : __(
                                                                          'keywords.payment',
                                                                      ) ||
                                                                      'دفعة'}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {sale?.note && (
                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <FileText
                                        size={16}
                                        className="text-gray-600"
                                    />
                                    <h4 className="text-xs font-black text-gray-700">
                                        {__('keywords.note') || 'ملاحظة'}
                                    </h4>
                                </div>
                                <p className="text-sm font-semibold leading-relaxed text-gray-700">
                                    {sale.note}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Show.layout = (page) => <MainLayout>{page}</MainLayout>;
