import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronDown, ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';

const EMPTY_ITEM = () => ({
    id: Date.now() + Math.random(),
    product_id: '',
    item_name: '',
    purchase_price: '',
    sale_price: '',
    quantity: 1,
});

const Edit = ({ purchase, suppliers = [], products = [] }) => {
    const { data, setData, put, processing, errors } = useForm({
        supplier_id: purchase?.supplier_id ?? '',
        payment_type: purchase?.payment_type ?? 'cash',
        amount: Number(purchase?.amount ?? purchase?.total_price ?? 0),
        payment_note: purchase?.payment_note ?? '',
        note: purchase?.note ?? '',
        items: purchase?.items?.map((item, index) => ({
            id: item.id ?? Date.now() + index,
            product_id: item.product_id ?? '',
            item_name: item.item_name ?? item.product?.name ?? '',
            purchase_price:
                item.purchase_price ?? item.product?.purchase_price ?? '',
            sale_price: item.product?.sale_price ?? '',
            quantity: Number(item.quantity ?? 1),
        })) ?? [EMPTY_ITEM()],
    });

    const calculateTotal = () => {
        return data.items.reduce((total, item) => {
            return (
                total +
                (parseFloat(item.purchase_price) || 0) *
                    (parseInt(item.quantity, 10) || 0)
            );
        }, 0);
    };

    const totalAmount = calculateTotal();

    useEffect(() => {
        if (data.payment_type === 'cash') {
            setData('amount', Number(totalAmount.toFixed(2)));
        }
    }, [data.payment_type, totalAmount]);

    const handleItemChange = (index, field, value) => {
        const nextItems = [...data.items];
        nextItems[index] = { ...nextItems[index], [field]: value };

        if (field === 'product_id') {
            const selectedProduct = products.find(
                (product) => String(product.id) === String(value),
            );

            nextItems[index].item_name = selectedProduct?.name ?? '';

            if (selectedProduct && !nextItems[index].purchase_price) {
                nextItems[index].purchase_price =
                    selectedProduct.purchase_price;
            }

            if (selectedProduct && !nextItems[index].sale_price) {
                nextItems[index].sale_price = selectedProduct.sale_price;
            }
        }

        setData('items', nextItems);
    };

    const addItem = () => {
        setData('items', [...data.items, EMPTY_ITEM()]);
    };

    const removeItem = (indexToRemove) => {
        if (data.items.length > 1) {
            setData(
                'items',
                data.items.filter((_, index) => index !== indexToRemove),
            );
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        put(route('purchases.update', purchase.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="تعديل فاتورة شراء" />

            <div
                className="relative mx-auto mb-8 max-w-5xl font-['Cairo']"
                dir="rtl"
            >
                <div className="mb-6 flex items-center gap-3 text-2xl font-bold">
                    <Link
                        href={route('purchases.index')}
                        className="text-gray-500 transition-colors hover:text-gray-800"
                    >
                        المشتريات
                    </Link>
                    <ChevronLeft
                        size={22}
                        className="mt-1 text-gray-400"
                        strokeWidth={2.5}
                    />
                    <span className="text-gray-900">
                        تعديل فاتورة #{purchase?.number || purchase?.id}
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex justify-start border-b border-gray-100 px-6 py-4">
                            <h3 className="text-sm font-bold text-gray-800">
                                بيانات الفاتورة
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 items-end gap-8 p-6 md:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <label className="flex justify-start text-sm font-semibold text-gray-800">
                                    <span className="ml-1 text-red-500">*</span>
                                    اسم المورد
                                </label>
                                <div className="relative">
                                    <select
                                        value={data.supplier_id}
                                        onChange={(e) =>
                                            setData(
                                                'supplier_id',
                                                e.target.value,
                                            )
                                        }
                                        className={`w-full cursor-pointer appearance-none rounded-xl border ${errors.supplier_id ? 'border-red-500' : 'border-gray-200'} bg-transparent py-3 pl-10 pr-4 text-right text-sm text-gray-600 focus:border-black focus:outline-none`}
                                    >
                                        <option value="">اختار المورد</option>
                                        {suppliers.map((supplier) => (
                                            <option
                                                key={supplier.id}
                                                value={supplier.id}
                                            >
                                                {supplier.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        className="absolute left-4 top-3.5 text-gray-400"
                                        size={18}
                                    />
                                </div>
                                {errors.supplier_id && (
                                    <p className="text-xs text-red-500">
                                        {errors.supplier_id}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 border-r border-gray-100 md:border-l md:border-r-0 md:pl-8">
                                <label className="text-sm font-semibold text-gray-800">
                                    نوع الدفع
                                </label>
                                <div className="flex w-full items-center justify-between rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData('payment_type', 'cash')
                                        }
                                        className={`flex-1 rounded-full py-2 text-sm font-bold transition-all ${data.payment_type === 'cash' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
                                    >
                                        نقدي
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData('payment_type', 'credit')
                                        }
                                        className={`flex-1 rounded-full py-2 text-sm font-bold transition-all ${data.payment_type === 'credit' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
                                    >
                                        آجل
                                    </button>
                                </div>
                                {errors.payment_type && (
                                    <p className="text-xs text-red-500">
                                        {errors.payment_type}
                                    </p>
                                )}

                                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-semibold text-gray-600">
                                            {data.payment_type === 'cash'
                                                ? 'المبلغ المدفوع'
                                                : 'الدفعة الأولى'}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.amount}
                                            onChange={(e) =>
                                                setData(
                                                    'amount',
                                                    e.target.value,
                                                )
                                            }
                                            disabled={
                                                data.payment_type === 'cash'
                                            }
                                            className={`w-full rounded-xl border ${errors.amount ? 'border-red-500' : 'border-gray-200'} px-4 py-2.5 text-sm focus:border-black focus:outline-none ${data.payment_type === 'cash' ? 'bg-gray-50 text-gray-500' : ''}`}
                                        />
                                        {errors.amount && (
                                            <p className="text-xs text-red-500">
                                                {errors.amount}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-semibold text-gray-600">
                                            ملاحظة الدفع
                                        </label>
                                        <input
                                            type="text"
                                            value={data.payment_note}
                                            onChange={(e) =>
                                                setData(
                                                    'payment_note',
                                                    e.target.value,
                                                )
                                            }
                                            className={`w-full rounded-xl border ${errors.payment_note ? 'border-red-500' : 'border-gray-200'} px-4 py-2.5 text-sm focus:border-black focus:outline-none`}
                                        />
                                        {errors.payment_note && (
                                            <p className="text-xs text-red-500">
                                                {errors.payment_note}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex justify-start border-b border-gray-100 px-6 py-4">
                            <h3 className="text-sm font-bold text-gray-800">
                                اصناف الفاتورة
                            </h3>
                        </div>

                        <div className="p-6">
                            {data.items.map((item, index) => {
                                const productError =
                                    errors[`items.${index}.product_id`];
                                const priceError =
                                    errors[`items.${index}.purchase_price`];
                                const salePriceError =
                                    errors[`items.${index}.sale_price`];
                                const qtyError =
                                    errors[`items.${index}.quantity`];

                                return (
                                    <div
                                        key={item.id}
                                        className="mb-4 grid grid-cols-1 items-end gap-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto]"
                                    >
                                        <div className="flex flex-col gap-2">
                                            <label className="flex justify-start text-sm font-semibold text-gray-800">
                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                                منتج
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={item.product_id}
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            index,
                                                            'product_id',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={`w-full cursor-pointer appearance-none rounded-xl border ${productError ? 'border-red-500' : 'border-gray-200'} bg-transparent py-3 pl-10 pr-4 text-right text-sm text-gray-600 focus:border-black focus:outline-none`}
                                                >
                                                    <option value="">
                                                        اختار المنتج
                                                    </option>
                                                    {products.map((product) => (
                                                        <option
                                                            key={product.id}
                                                            value={product.id}
                                                        >
                                                            {product.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown
                                                    className="absolute left-4 top-3.5 text-gray-400"
                                                    size={18}
                                                />
                                            </div>
                                            {productError && (
                                                <p className="text-xs text-red-500">
                                                    {productError}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="flex justify-start text-sm font-semibold text-gray-800">
                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                                سعر الشراء
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.purchase_price}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        'purchase_price',
                                                        e.target.value,
                                                    )
                                                }
                                                className={`w-full rounded-xl border ${priceError ? 'border-red-500' : 'border-gray-200'} px-4 py-3 text-center text-sm focus:border-black focus:outline-none`}
                                            />
                                            {priceError && (
                                                <p className="text-xs text-red-500">
                                                    {priceError}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="flex justify-start text-sm font-semibold text-gray-800">
                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                                الكمية
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        'quantity',
                                                        e.target.value,
                                                    )
                                                }
                                                className={`w-full rounded-xl border ${qtyError ? 'border-red-500' : 'border-gray-200'} px-4 py-3 text-center text-sm focus:border-black focus:outline-none`}
                                            />
                                            {qtyError && (
                                                <p className="text-xs text-red-500">
                                                    {qtyError}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="flex justify-start text-sm font-semibold text-gray-800">
                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                                سعر البيع
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.sale_price}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        'sale_price',
                                                        e.target.value,
                                                    )
                                                }
                                                className={`w-full rounded-xl border ${salePriceError ? 'border-red-500' : 'border-gray-200'} px-4 py-3 text-center text-sm focus:border-black focus:outline-none`}
                                            />
                                            {salePriceError && (
                                                <p className="text-xs text-red-500">
                                                    {salePriceError}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex pb-0.5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItem(index)
                                                }
                                                disabled={
                                                    data.items.length === 1
                                                }
                                                className="flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:hover:bg-red-50 disabled:hover:text-red-500"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="mt-6 flex justify-start">
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-6 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-100"
                                >
                                    <Plus size={18} />
                                    إضافة منتج آخر
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-gray-50 p-6">
                            <div className="flex w-fit items-center gap-8 rounded-2xl bg-[#f3f4f6] px-6 py-4">
                                <div className="flex flex-col gap-1 text-right text-[15px] font-bold text-gray-800">
                                    <div>
                                        اجمالي :{' '}
                                        <span className="mx-1">
                                            {totalAmount.toFixed(2)}
                                        </span>{' '}
                                        ج.م
                                    </div>
                                    <div>
                                        المطلوب سداده{' '}
                                        <span className="mx-1">
                                            {Math.max(
                                                totalAmount -
                                                    Number(data.amount || 0),
                                                0,
                                            ).toFixed(2)}
                                        </span>{' '}
                                        ج.م
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        data.items.some(
                                            (item) =>
                                                !item.product_id ||
                                                !item.purchase_price ||
                                                !item.sale_price ||
                                                !item.quantity,
                                        )
                                    }
                                    className="rounded-2xl bg-black px-10 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                                >
                                    حفظ التعديلات
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

Edit.layout = (page) => <MainLayout>{page}</MainLayout>;

export default Edit;
