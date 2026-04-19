import useTranslation from '@/hooks/useTranslation';
import { useForm } from '@inertiajs/react';
import { ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const FormInput = ({
    label,
    placeholder,
    type = 'text',
    required = false,
    value,
    onChange,
    error,
}) => (
    <div className="mb-4 text-right">
        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`w-full border px-4 py-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'} rounded-2xl text-right text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1`}
            dir="rtl"
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

const FormTextarea = ({
    label,
    placeholder,
    required = false,
    value,
    onChange,
    error,
}) => (
    <div className="mb-4 text-right lg:col-span-2">
        <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows="3"
            className={`w-full border px-4 py-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'} rounded-2xl text-right text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1`}
            dir="rtl"
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

export default function ProductModal({
    isOpen,
    onClose,
    product = null,
    categories = [],
}) {
    const { __ } = useTranslation();
    const isEditing = !!product;

    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');
    const dropdownRef = useRef(null);

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
        clearErrors,
        setError,
    } = useForm({
        name: '',
        category_id: '',
        purchase_price: '',
        sale_price: '',
        quantity: '',
        min_quantity: '',
        description: '',
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            setCategorySearch('');
            setIsSelectOpen(false);
            if (isEditing) {
                setData({
                    name: product.name || '',
                    category_id: product.category_id || '',
                    purchase_price: product.purchase_price || '',
                    sale_price: product.sale_price || '',
                    quantity: product.quantity || '',
                    min_quantity: product.min_quantity || '',
                    description: product.description || '',
                });
            } else {
                reset();
            }
        }
    }, [isOpen, product]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsSelectOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        let hasError = false;
        if (!data.name.trim()) {
            setError('name', __('keywords.required') || 'مطلوب');
            hasError = true;
        }
        if (!data.category_id) {
            setError('category_id', __('keywords.required') || 'مطلوب');
            hasError = true;
        }
        if (hasError) return;

        if (isEditing) {
            put(route('products.update', product.id), {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        } else {
            post(route('products.store'), {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        }
    };

    const filteredCategories = categories.filter((c) =>
        c.name.toLowerCase().includes(categorySearch.toLowerCase()),
    );
    const selectedCategory = categories.find((c) => c.id === data.category_id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity">
            <div
                className="animate-in fade-in zoom-in-95 relative w-full max-w-2xl rounded-[24px] bg-white p-6 font-['Cairo'] shadow-2xl duration-200"
                dir="rtl"
            >
                <button
                    onClick={onClose}
                    className="absolute left-5 top-5 text-gray-400 transition-colors hover:text-gray-700"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>

                <h2 className="mb-6 mt-2 text-center text-[15px] font-bold text-gray-500">
                    {isEditing
                        ? __('keywords.edit') + ' ' + __('keywords.product')
                        : __('keywords.add') + ' ' + __('keywords.product')}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-x-6 lg:grid-cols-2">
                        <FormInput
                            label={__('keywords.name')}
                            placeholder="اسم المنتج"
                            required={true}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                        />

                        <div
                            className="relative mb-4 text-right"
                            ref={dropdownRef}
                        >
                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                {__('keywords.category')}{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <div
                                onClick={() => setIsSelectOpen(!isSelectOpen)}
                                className={`w-full border px-4 py-2 ${errors.category_id ? 'border-red-500' : 'border-gray-300'} flex cursor-pointer items-center justify-between rounded-2xl text-sm`}
                            >
                                <span
                                    className={
                                        selectedCategory
                                            ? 'text-gray-900'
                                            : 'text-gray-400'
                                    }
                                >
                                    {selectedCategory
                                        ? selectedCategory.name
                                        : 'اختر القسم'}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className={`text-gray-400 transition-transform ${isSelectOpen ? 'rotate-180' : ''}`}
                                />
                            </div>

                          
                            {isSelectOpen && (
                                <div className="absolute z-10 mt-1 flex max-h-48 w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                                    <div className="flex items-center gap-2 border-b border-gray-100 p-2">
                                        <Search
                                            size={14}
                                            className="text-gray-400"
                                        />
                                        <input
                                            type="text"
                                            placeholder="بحث في الأقسام..."
                                            value={categorySearch}
                                            onChange={(e) =>
                                                setCategorySearch(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full bg-transparent text-sm outline-none"
                                        />
                                    </div>
                                    <div className="overflow-y-auto">
                                        {filteredCategories.length > 0 ? (
                                            filteredCategories.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    onClick={() => {
                                                        setData(
                                                            'category_id',
                                                            cat.id,
                                                        );
                                                        setIsSelectOpen(false);
                                                    }}
                                                    className={`cursor-pointer px-4 py-2 text-sm hover:bg-gray-50 ${data.category_id === cat.id ? 'bg-gray-50 font-bold' : ''}`}
                                                >
                                                    {cat.name}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-center text-sm text-gray-500">
                                                لا توجد أقسام
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {errors.category_id && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.category_id}
                                </p>
                            )}
                        </div>

                        <FormInput
                            label={__('keywords.purchase_price')}
                            placeholder="0.00"
                            type="number"
                            value={data.purchase_price}
                            onChange={(e) =>
                                setData('purchase_price', e.target.value)
                            }
                            error={errors.purchase_price}
                        />
                        <FormInput
                            label={__('keywords.sale_price')}
                            placeholder="0.00"
                            type="number"
                            value={data.sale_price}
                            onChange={(e) =>
                                setData('sale_price', e.target.value)
                            }
                            error={errors.sale_price}
                        />

                        <FormInput
                            label={__('keywords.quantity')}
                            placeholder="الكمية المتاحة"
                            type="number"
                            value={data.quantity}
                            onChange={(e) =>
                                setData('quantity', e.target.value)
                            }
                            error={errors.quantity}
                        />
                        <FormInput
                            label={__('keywords.min_quantity')}
                            placeholder="تنبيه النواقص"
                            type="number"
                            value={data.min_quantity}
                            onChange={(e) =>
                                setData('min_quantity', e.target.value)
                            }
                            error={errors.min_quantity}
                        />

                        <FormTextarea
                            label={__('keywords.description')}
                            placeholder="وصف المنتج (اختياري)"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            error={errors.description}
                        />
                    </div>

                    <div className="mb-2 mt-4 flex items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-32 rounded-full border border-gray-400 px-8 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50"
                        >
                            {__('keywords.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                    
                            className="min-w-[130px] whitespace-nowrap rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-gray-800 disabled:opacity-50"
                        >
                            {processing
                                ? __('keywords.loading_short')
                                : isEditing
                                  ? __('keywords.save')
                                  : `${__('keywords.add')} ${__('keywords.product')}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
