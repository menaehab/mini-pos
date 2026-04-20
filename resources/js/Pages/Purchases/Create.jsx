import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronDown, ChevronLeft, Plus, Trash2 } from 'lucide-react';

export default function Create({ suppliers = [], products = [] }) {
    const { data, setData, post, processing } = useForm({
        supplier_id: '',
        payment_method: 'cash',
        items: [
            { id: Date.now(), product_id: '', cost_price: '', quantity: 1 },
        ],
    });

    const calculateTotal = () => {
        return data.items.reduce((total, item) => {
            return (
                total +
                (parseFloat(item.cost_price) || 0) *
                    (parseInt(item.quantity) || 0)
            );
        }, 0);
    };

    const addItem = () => {
        setData('items', [
            ...data.items,
            { id: Date.now(), product_id: '', cost_price: '', quantity: 1 },
        ]);
    };

    
    const removeItem = (indexToRemove) => {
        if (data.items.length > 1) {
            const newItems = data.items.filter(
                (_, index) => index !== indexToRemove,
            );
            setData('items', newItems);
        }
    };

    const totalAmount = calculateTotal();

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitting:', data);
        post(route('purchases.store'));
    };

    return (
        <>
            <Head title="انشاء فاتورة شراء" />

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
                    <span className="text-gray-900">انشاء فاتورة شراء</span>
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
                                    <span className="ml-1 text-red-500">*</span>{' '}
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
                                        className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-transparent py-3 pl-10 pr-4 text-right text-sm text-gray-600 focus:border-black focus:outline-none"
                                    >
                                        <option value="">المورد</option>
                                        <option value="1">مينا ايهاب</option>
                                    </select>
                                    <ChevronDown
                                        className="absolute left-4 top-3.5 text-gray-400"
                                        size={18}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 border-r border-gray-100 md:border-l md:border-r-0 md:pl-8">
                                <label className="flex items-center justify-start gap-1 text-sm font-semibold text-gray-800">
                                    طريقة الدفع
                                </label>
                                <div className="flex w-full items-center justify-between rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData('payment_method', 'cash')
                                        }
                                        className={`flex-1 rounded-full py-2 text-sm font-bold transition-all ${data.payment_method === 'cash' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
                                    >
                                        نقدي
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData(
                                                'payment_method',
                                                'installments',
                                            )
                                        }
                                        className={`flex-1 rounded-full py-2 text-sm font-bold transition-all ${data.payment_method === 'installments' ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}
                                    >
                                        اقساط
                                    </button>
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
                            {data.items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="mb-4 grid grid-cols-1 items-end gap-4 md:grid-cols-[2fr_1fr_1fr_auto]"
                                >
                                    
                                    <div className="flex flex-col gap-2">
                                        <label className="flex justify-start text-sm font-semibold text-gray-800">
                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>{' '}
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
                                                className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-transparent py-3 pl-10 pr-4 text-right text-sm text-gray-600 focus:border-black focus:outline-none"
                                            >
                                                <option value="">
                                                    اختار المنتج
                                                </option>
                                                <option value="1">قطن</option>
                                                <option value="2">
                                                    قماش حرير
                                                </option>
                                            </select>
                                            <ChevronDown
                                                className="absolute left-4 top-3.5 text-gray-400"
                                                size={18}
                                            />
                                        </div>
                                    </div>

                                    
                                    <div className="flex flex-col gap-2">
                                        <label className="flex justify-start text-sm font-semibold text-gray-800">
                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>{' '}
                                            سعر التكلفة
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="سعر"
                                            value={item.cost_price}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    'cost_price',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-sm focus:border-black focus:outline-none"
                                        />
                                    </div>

                                    
                                    <div className="flex flex-col gap-2">
                                        <label className="flex justify-start text-sm font-semibold text-gray-800">
                                            <span className="ml-1 text-red-500">
                                                *
                                            </span>{' '}
                                            الكمية
                                        </label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                handleItemChange(
                                                    index,
                                                    'quantity',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-sm focus:border-black focus:outline-none"
                                        />
                                    </div>

                                    
                                    <div className="flex pb-0.5">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            disabled={data.items.length === 1}
                                            className="flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:hover:bg-red-50 disabled:hover:text-red-500"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            
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
                                            {totalAmount || '0.00'}
                                        </span>{' '}
                                        ج.م
                                    </div>
                                    <div>
                                        المطلوب سداده{' '}
                                        <span className="mx-1">
                                            {totalAmount || '0.00'}
                                        </span>{' '}
                                        ج.م
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-2xl bg-black px-10 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                                >
                                    حفظ المرتجع
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = (page) => <MainLayout>{page}</MainLayout>;
