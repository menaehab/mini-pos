import CustomerSearchSelect from '@/Components/Pos/CustomerSearchSelect';
import useTranslation from '@/hooks/useTranslation';
import MainLayout from '@/Layouts/MainLayout';
import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertCircle,
    ChevronLeft,
    CircleDollarSign,
    Package,
    Plus,
    Save,
    Trash2,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const SaleTypeEnum = {
    CASH: 'cash',
    INSTALLMENT: 'installment',
};

export default function Edit({ sale }) {
    const { __ } = useTranslation();
    const [products, setProducts] = useState([]);

    const [selectedCustomer, setSelectedCustomer] = useState(
        sale?.customer
            ? {
                  id: sale.customer.id,
                  name: sale.customer.name,
                  phone: sale.customer.phone,
                  address: sale.customer.address,
                  national_number: sale.customer.national_number,
              }
            : null,
    );

    const { data, setData, put, processing, errors } = useForm({
        customer_id: sale?.customer_id ?? '',
        customer_name: sale?.customer_name ?? sale?.customer?.name ?? '',
        type: sale?.type ?? SaleTypeEnum.CASH,
        note: sale?.note ?? '',
        down_payment: Number(sale?.paid_amount ?? sale?.total_price ?? 0),
        installment_months: sale?.installment_months ?? 1,
        installment_rate: sale?.installment_rate ?? 0,
        items:
            sale?.items?.map((item) => ({
                id: item.id,
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: Number(item.quantity || 1),
                sale_price: Number(item.sale_price || 0),
                purchase_price: Number(item.purchase_price || 0),
            })) ?? [],
    });

    useEffect(() => {
        if (selectedCustomer) {
            setData('customer_id', selectedCustomer.id);
            setData('customer_name', selectedCustomer.name);
        }
    }, [selectedCustomer]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(route('products.search'), {
                    params: { per_page: 300 },
                });
                setProducts(response.data.data || []);
            } catch (error) {
                setProducts([]);
            }
        };

        fetchProducts();
    }, []);

    const isInstallment = data.type === SaleTypeEnum.INSTALLMENT;

    const subtotal = data.items.reduce(
        (sum, item) =>
            sum + Number(item.sale_price || 0) * Number(item.quantity || 0),
        0,
    );

    const interestAmount = isInstallment
        ? (subtotal * Number(data.installment_rate || 0)) / 100
        : 0;

    const totalWithInterest = subtotal + interestAmount;

    const remaining = Math.max(
        totalWithInterest - Number(data.down_payment || 0),
        0,
    );

    const monthlyInstallment =
        isInstallment && Number(data.installment_months || 0) > 0
            ? remaining / Number(data.installment_months)
            : 0;

    const itemError = (index, field) => errors[`items.${index}.${field}`];

    const updateItem = (index, field, value) => {
        const nextItems = data.items.map((item, itemIndex) =>
            itemIndex === index ? { ...item, [field]: value } : item,
        );

        setData('items', nextItems);
    };

    const removeItem = (index) => {
        setData(
            'items',
            data.items.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    const addItem = () => {
        setData('items', [
            ...data.items,
            {
                product_id: '',
                product_name: '',
                quantity: 1,
                sale_price: 0,
                purchase_price: 0,
            },
        ]);
    };

    const handleSelectProduct = (index, productId) => {
        const selectedProduct = products.find(
            (product) => String(product.id) === String(productId),
        );

        if (!selectedProduct) {
            updateItem(index, 'product_id', '');
            return;
        }

        const nextItems = data.items.map((item, itemIndex) =>
            itemIndex === index
                ? {
                      ...item,
                      product_id: selectedProduct.id,
                      product_name: selectedProduct.name,
                      sale_price: Number(selectedProduct.sale_price || 0),
                      purchase_price: Number(
                          selectedProduct.purchase_price || 0,
                      ),
                  }
                : item,
        );

        setData('items', nextItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        put(route('sales.update', sale.id), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={__('keywords.edit_sale') || 'تعديل الفاتورة'} />

            <div
                className="relative mx-auto mb-8 max-w-7xl font-['Cairo']"
                dir="rtl"
            >
                <div className="mb-8 flex items-center justify-start gap-2 text-right">
                    <button
                        type="button"
                        onClick={() => router.get(route('sales.index'))}
                        className="text-lg font-bold text-gray-500 transition-colors hover:text-black"
                    >
                        {__('keywords.sales') || 'المبيعات'}
                    </button>
                    <ChevronLeft size={20} className="mt-1 text-gray-400" />
                    <h1 className="text-xl font-bold text-gray-900">
                        {__('keywords.edit_sale') || 'تعديل الفاتورة'} #
                        {sale?.number || sale?.id}
                    </h1>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3"
                >
                    <div className="flex flex-col gap-6 lg:col-span-1">
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center gap-2">
                                <User size={18} className="text-gray-600" />
                                <h3 className="text-sm font-black text-gray-900">
                                    {__('keywords.customer') || 'العميل'}
                                </h3>
                            </div>

                            <div className="space-y-3">
                                <CustomerSearchSelect
                                    selected={selectedCustomer}
                                    setSelected={setSelectedCustomer}
                                    onAddNew={() =>
                                        router.get(route('customers.create'))
                                    }
                                />

                                {errors.customer_id && (
                                    <p className="flex items-center gap-1 text-xs text-red-500">
                                        <AlertCircle size={12} />
                                        {errors.customer_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center gap-2">
                                <CircleDollarSign
                                    size={18}
                                    className="text-gray-600"
                                />
                                <h3 className="text-sm font-black text-gray-900">
                                    {__('keywords.payment_type') || 'نوع الدفع'}
                                </h3>
                            </div>

                            <div className="mb-4 grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setData('type', SaleTypeEnum.CASH)
                                    }
                                    className={`rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                                        data.type === SaleTypeEnum.CASH
                                            ? 'bg-black text-white shadow-lg'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    }`}
                                >
                                    {__('keywords.cash') || 'كاش'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setData(
                                            'type',
                                            SaleTypeEnum.INSTALLMENT,
                                        )
                                    }
                                    className={`rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                                        data.type === SaleTypeEnum.INSTALLMENT
                                            ? 'bg-black text-white shadow-lg'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    }`}
                                >
                                    {__('keywords.installment') || 'تقسيط'}
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-gray-500">
                                        {isInstallment
                                            ? __('keywords.down_payment') ||
                                              'الدفعة المقدمة'
                                            : __('keywords.amount_paid') ||
                                              'المبلغ المدفوع'}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.down_payment}
                                        onChange={(e) =>
                                            setData(
                                                'down_payment',
                                                Number(e.target.value || 0),
                                            )
                                        }
                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-right text-sm font-semibold focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                    />
                                    {errors.down_payment && (
                                        <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                            <AlertCircle size={12} />
                                            {errors.down_payment}
                                        </p>
                                    )}
                                </div>

                                {isInstallment && (
                                    <>
                                        <div>
                                            <label className="mb-1 block text-xs font-bold text-gray-500">
                                                {__(
                                                    'keywords.installment_months',
                                                ) || 'عدد الأشهر'}
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={data.installment_months}
                                                onChange={(e) =>
                                                    setData(
                                                        'installment_months',
                                                        Number(
                                                            e.target.value || 1,
                                                        ),
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-right text-sm font-semibold focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                            />
                                            {errors.installment_months && (
                                                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                                    <AlertCircle size={12} />
                                                    {errors.installment_months}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-bold text-gray-500">
                                                {__('keywords.interest_rate') ||
                                                    'الفائدة'}{' '}
                                                (%)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.installment_rate}
                                                onChange={(e) =>
                                                    setData(
                                                        'installment_rate',
                                                        Number(
                                                            e.target.value || 0,
                                                        ),
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-right text-sm font-semibold focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                            />
                                            {errors.installment_rate && (
                                                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                                    <AlertCircle size={12} />
                                                    {errors.installment_rate}
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-sm font-black text-gray-900">
                                {__('keywords.summary') || 'الملخص'}
                            </h3>

                            <div className="space-y-2 text-sm font-semibold">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500">
                                        {__('keywords.subtotal') || 'المجموع'}
                                    </span>
                                    <span>{subtotal.toFixed(2)} ج.م</span>
                                </div>

                                {isInstallment && (
                                    <>
                                        <div className="flex items-center justify-between text-blue-700">
                                            <span>
                                                {__('keywords.interest') ||
                                                    'الفائدة'}{' '}
                                                (
                                                {Number(
                                                    data.installment_rate || 0,
                                                ).toFixed(2)}
                                                %)
                                            </span>
                                            <span>
                                                +{interestAmount.toFixed(2)} ج.م
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-gray-100 pt-2 font-black">
                                            <span>
                                                {__(
                                                    'keywords.monthly_installment',
                                                ) || 'القسط الشهري'}
                                            </span>
                                            <span>
                                                {monthlyInstallment.toFixed(2)}{' '}
                                                ج.م
                                            </span>
                                        </div>
                                    </>
                                )}

                                <div className="flex items-center justify-between border-t border-gray-100 pt-2 font-black text-gray-900">
                                    <span>
                                        {__('keywords.remaining') || 'المتبقي'}
                                    </span>
                                    <span>{remaining.toFixed(2)} ج.م</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-3.5 text-sm font-black text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Save size={16} />
                                {processing
                                    ? __('keywords.processing') ||
                                      'جاري الحفظ...'
                                    : __('keywords.save') || 'حفظ التعديلات'}
                            </button>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Package size={18} className="text-gray-600" />
                                <h3 className="text-sm font-black text-gray-900">
                                    {__('keywords.items') || 'الأصناف'}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-2 rounded-xl bg-black px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-800"
                            >
                                <Plus size={14} />
                                {__('keywords.add') || 'إضافة'}
                            </button>
                        </div>

                        <div className="space-y-3">
                            {data.items.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm font-bold text-gray-400">
                                    {__('keywords.no_items') || 'لا توجد أصناف'}
                                </div>
                            ) : (
                                data.items.map((item, index) => (
                                    <div
                                        key={item.id || index}
                                        className="grid grid-cols-1 gap-3 rounded-xl border border-gray-100 bg-gray-50/40 p-4 md:grid-cols-12"
                                    >
                                        <div className="md:col-span-5">
                                            <label className="mb-1 block text-xs font-bold text-gray-500">
                                                {__('keywords.product_name') ||
                                                    'المنتج'}
                                            </label>
                                            <select
                                                value={item.product_id || ''}
                                                onChange={(e) =>
                                                    handleSelectProduct(
                                                        index,
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-right text-sm font-semibold focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                            >
                                                <option value="">
                                                    {__('keywords.select') ||
                                                        'اختر منتج'}
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
                                            {itemError(
                                                index,
                                                'product_name',
                                            ) && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {itemError(
                                                        index,
                                                        'product_name',
                                                    )}
                                                </p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="mb-1 block text-xs font-bold text-gray-500">
                                                {__('keywords.sale_price') ||
                                                    'سعر البيع'}
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.sale_price}
                                                readOnly
                                                className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 text-right text-sm font-semibold text-gray-600"
                                            />
                                            {itemError(index, 'sale_price') && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {itemError(
                                                        index,
                                                        'sale_price',
                                                    )}
                                                </p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="mb-1 block text-xs font-bold text-gray-500">
                                                {__('keywords.quantity') ||
                                                    'الكمية'}
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        'quantity',
                                                        Number(
                                                            e.target.value || 1,
                                                        ),
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-right text-sm font-semibold focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                            />
                                            {itemError(index, 'quantity') && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {itemError(
                                                        index,
                                                        'quantity',
                                                    )}
                                                </p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="mb-1 block text-xs font-bold text-gray-500">
                                                {__('keywords.total') ||
                                                    'الإجمالي'}
                                            </label>
                                            <div className="rounded-xl border border-gray-100 bg-white px-3 py-2.5 text-sm font-black text-gray-700">
                                                {(
                                                    Number(
                                                        item.sale_price || 0,
                                                    ) *
                                                    Number(item.quantity || 0)
                                                ).toFixed(2)}{' '}
                                                ج.م
                                            </div>
                                        </div>

                                        <div className="md:col-span-1 md:self-end">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItem(index)
                                                }
                                                className="flex h-10 w-full items-center justify-center rounded-xl border border-red-100 bg-white text-red-500 transition-colors hover:bg-red-50"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <input
                                            type="hidden"
                                            value={item.product_id}
                                            onChange={() => {}}
                                        />
                                        {itemError(index, 'product_id') && (
                                            <p className="text-xs text-red-500 md:col-span-12">
                                                {itemError(index, 'product_id')}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {errors.items && (
                            <p className="mt-3 flex items-center gap-1 text-xs text-red-500">
                                <AlertCircle size={12} />
                                {errors.items}
                            </p>
                        )}

                        <div className="mt-6">
                            <label className="mb-1 block text-xs font-bold text-gray-500">
                                {__('keywords.note') || 'ملاحظة'}
                            </label>
                            <textarea
                                value={data.note}
                                onChange={(e) =>
                                    setData('note', e.target.value)
                                }
                                rows={3}
                                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-right text-sm font-semibold focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                            />
                            {errors.note && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.note}
                                </p>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page) => <MainLayout>{page}</MainLayout>;
