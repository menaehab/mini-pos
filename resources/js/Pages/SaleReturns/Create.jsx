import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Loader2, Search } from 'lucide-react';
import { useState } from 'react';

export default function Create() {
    const [loadingInvoice, setLoadingInvoice] = useState(false);
    const [invoiceError, setInvoiceError] = useState('');
    const [saleMeta, setSaleMeta] = useState(null);

    const { data, setData, post, processing, transform } = useForm({
        sale_id: null,
        invoice_number_search: '',
        note: '',
        is_refunded: false,
        items: [],
    });

    const calculateTotals = () => {
        let count = 0;
        let total = 0;
        data.items.forEach((item) => {
            if (item.selected && item.quantity > 0) {
                count += 1;
                total += item.quantity * item.sale_price;
            }
        });
        return { count, total };
    };

    const { count: selectedCount, total: returnTotal } = calculateTotals();

    const searchInvoice = async () => {
        const invoiceNumber = data.invoice_number_search.trim();

        if (!invoiceNumber) {
            setInvoiceError('من فضلك ادخل رقم فاتورة البيع أولاً');
            setSaleMeta(null);
            setData('sale_id', null);
            setData('items', []);

            return;
        }

        setLoadingInvoice(true);
        setInvoiceError('');

        try {
            const response = await fetch(
                route('sale-returns.find-sale', invoiceNumber),
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            if (!response.ok) {
                setSaleMeta(null);
                setData('sale_id', null);
                setData('items', []);
                setInvoiceError(
                    'الفاتورة غير موجودة أو لا تحتوي على منتجات صالحة للارجاع',
                );

                return;
            }

            const payload = await response.json();

            const loadedItems = (payload.items || []).map((item) => ({
                id: item.product_id,
                product_id: item.product_id,
                name: item.name,
                sale_price: Number(item.sale_price || 0),
                max_qty: Number(item.max_qty || 0),
                quantity: 1,
                selected: true,
            }));

            if (loadedItems.length === 0) {
                setSaleMeta(null);
                setData('sale_id', null);
                setData('items', []);
                setInvoiceError('كل منتجات الفاتورة تم ارجاعها بالفعل');

                return;
            }

            setSaleMeta({
                number: payload.number,
                customer_name: payload.customer_name,
            });
            setData('sale_id', payload.sale_id);
            setData('items', loadedItems);
        } catch {
            setSaleMeta(null);
            setData('sale_id', null);
            setData('items', []);
            setInvoiceError('حصل خطأ أثناء تحميل بيانات الفاتورة');
        } finally {
            setLoadingInvoice(false);
        }
    };

    const handleQtyChange = (id, newQty) => {
        setData(
            'items',
            data.items.map((item) => {
                if (item.id === id) {
                    const validQty = Math.min(
                        Math.max(0, newQty),
                        item.max_qty,
                    );
                    return {
                        ...item,
                        quantity: validQty,
                        selected: validQty > 0,
                    };
                }
                return item;
            }),
        );
    };

    const toggleSelect = (id) => {
        setData(
            'items',
            data.items.map((item) => {
                if (item.id === id) {
                    const newSelected = !item.selected;
                    return {
                        ...item,
                        selected: newSelected,
                        quantity: newSelected ? 1 : 0,
                    };
                }
                return item;
            }),
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.sale_id) {
            setInvoiceError('من فضلك ابحث عن فاتورة البيع أولاً');

            return;
        }

        const selectedItems = data.items.filter(
            (item) => item.selected && item.quantity > 0,
        );

        if (selectedItems.length === 0) {
            setInvoiceError('حدد منتج واحد على الأقل للارجاع');

            return;
        }

        transform((formData) => ({
            ...formData,
            items: formData.items
                .filter((item) => item.selected && item.quantity > 0)
                .map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                })),
        }));

        post(route('sale-returns.store'), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="انشاء مرتجع مبيعات" />

            <div
                className="mb-58 relative mx-auto max-w-5xl font-['Cairo']"
                dir="rtl"
            >
                <div className="mb-6 flex items-center justify-start gap-3 text-2xl font-bold">
                    <Link
                        href={route('sale-returns.index')}
                        className="text-gray-500 transition-colors hover:text-gray-800"
                    >
                        مرتجع المبيعات
                    </Link>
                    <ChevronLeft
                        size={22}
                        className="mt-1 text-gray-400"
                        strokeWidth={2.5}
                    />
                    <span className="text-gray-900">انشاء مرتجع</span>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            رقم فاتورة البيع{' '}
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="بحث"
                                value={data.invoice_number_search}
                                onChange={(e) =>
                                    setData(
                                        'invoice_number_search',
                                        e.target.value,
                                    )
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        searchInvoice();
                                    }
                                }}
                                className="w-full rounded-xl border border-gray-200 py-3 pl-4 pr-10 text-right text-sm placeholder:text-gray-300 focus:border-black focus:outline-none"
                            />
                            <Search
                                className="absolute right-4 top-3.5 text-gray-300"
                                size={18}
                            />

                            <button
                                type="button"
                                onClick={searchInvoice}
                                disabled={loadingInvoice}
                                className="absolute left-2 top-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                            >
                                {loadingInvoice ? (
                                    <span className="flex items-center gap-1">
                                        <Loader2
                                            size={12}
                                            className="animate-spin"
                                        />
                                        جاري...
                                    </span>
                                ) : (
                                    'تحميل الفاتورة'
                                )}
                            </button>
                        </div>

                        {invoiceError && (
                            <p className="mt-2 text-xs font-semibold text-red-500">
                                {invoiceError}
                            </p>
                        )}

                        {saleMeta && (
                            <p className="mt-2 text-xs font-semibold text-gray-600">
                                تم تحميل الفاتورة #{saleMeta.number} - العميل:{' '}
                                {saleMeta.customer_name || '—'}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex justify-end border-b border-gray-100 px-6 py-4">
                            <h3 className="text-xs font-semibold text-gray-400">
                                حدد المنتجات التي تريد ارجاعها و ادخل الكميه لكل
                                منتج
                            </h3>
                        </div>
                        <div className="overflow-x-auto p-4">
                            <table className="w-full text-right text-sm">
                                <thead className="border-b border-gray-50 text-gray-400">
                                    <tr>
                                        <th className="w-1/3 px-6 py-4 text-right text-xs font-semibold">
                                            المنتج
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold">
                                            سعر البيع
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold">
                                            الكمية المتاحة
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold">
                                            كمية الارجاع
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-8 text-center text-sm font-semibold text-gray-400"
                                            >
                                                ادخل رقم فاتورة البيع واضغط
                                                تحميل الفاتورة أولاً
                                            </td>
                                        </tr>
                                    ) : (
                                        data.items.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b border-gray-50 transition-colors hover:bg-gray-50/50"
                                            >
                                                <td className="px-6 py-4">
                                                    <label className="flex w-fit cursor-pointer items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                item.selected
                                                            }
                                                            onChange={() =>
                                                                toggleSelect(
                                                                    item.id,
                                                                )
                                                            }
                                                            className="h-5 w-5 cursor-pointer rounded border-gray-300 text-black focus:ring-black"
                                                        />
                                                        <span className="font-bold text-gray-800">
                                                            {item.name}
                                                        </span>
                                                    </label>
                                                </td>

                                                <td className="px-6 py-4 text-center font-bold text-gray-800">
                                                    {item.sale_price} ج.م
                                                </td>

                                                <td className="px-6 py-4 text-center font-bold text-gray-800">
                                                    {item.max_qty}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="mr-auto flex w-24 items-center justify-center overflow-hidden rounded-lg border border-gray-200">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleQtyChange(
                                                                    item.id,
                                                                    item.quantity +
                                                                        1,
                                                                )
                                                            }
                                                            className="bg-gray-50 px-3 py-1 font-bold text-gray-500 hover:bg-gray-100"
                                                        >
                                                            +
                                                        </button>
                                                        <input
                                                            type="number"
                                                            value={
                                                                item.quantity
                                                            }
                                                            onChange={(e) =>
                                                                handleQtyChange(
                                                                    item.id,
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0,
                                                                )
                                                            }
                                                            className="w-10 border-none p-0 text-center text-sm font-bold focus:ring-0"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleQtyChange(
                                                                    item.id,
                                                                    item.quantity -
                                                                        1,
                                                                )
                                                            }
                                                            className="bg-gray-50 px-3 py-1 font-bold text-gray-500 hover:bg-gray-100"
                                                        >
                                                            -
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex justify-end border-b border-gray-100 px-6 py-4">
                            <h3 className="text-sm font-bold text-gray-800">
                                تفاصيل المرتجع
                            </h3>
                        </div>

                        <div className="flex flex-col gap-6 p-6">
                            <div className="flex flex-col items-end">
                                <label className="mb-2 block text-xs font-bold text-gray-800">
                                    السبب
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="ادخل سبب للارجاع"
                                    value={data.note}
                                    onChange={(e) =>
                                        setData('note', e.target.value)
                                    }
                                    className="w-full resize-none rounded-xl border border-gray-200 p-4 text-right text-sm placeholder:text-gray-300 focus:border-black focus:outline-none"
                                ></textarea>
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <span className="flex items-center gap-2 text-xs font-bold text-gray-800">
                                    استرداد نقدي
                                </span>
                                <div className="flex w-32 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData('is_refunded', false)
                                        }
                                        className={`flex-1 rounded-full py-1.5 text-xs font-bold transition-all ${!data.is_refunded ? 'border border-gray-100 bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
                                    >
                                        لا
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData('is_refunded', true)
                                        }
                                        className={`flex-1 rounded-full py-1.5 text-xs font-bold transition-all ${data.is_refunded ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}
                                    >
                                        نعم
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-start border-t border-gray-50 p-6">
                            <div className="flex min-w-[320px] items-center justify-between gap-8 rounded-[20px] bg-[#f3f4f6] px-6 py-4">
                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        selectedCount === 0 ||
                                        !data.sale_id
                                    }
                                    className="rounded-xl bg-black px-8 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-gray-800 disabled:opacity-50"
                                >
                                    حفظ المرتجع
                                </button>

                                <div className="flex flex-col gap-1 text-right text-[13px] font-bold text-gray-600">
                                    <div>
                                        عدد المنتجات المحدده :{' '}
                                        <span className="mx-1 text-[15px] text-[#dc2626]">
                                            {selectedCount}
                                        </span>
                                    </div>
                                    <div>
                                        اجمالي المرتجع :{' '}
                                        <span className="mx-1 text-[15px] text-[#dc2626]">
                                            {returnTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = (page) => <MainLayout>{page}</MainLayout>;
