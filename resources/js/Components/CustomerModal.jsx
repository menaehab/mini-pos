import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useEffect } from 'react';

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

export default function CustomerModal({ isOpen, onClose, customer = null, redirectBack = false }) {
    const isEditing = !!customer;

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
        phone: '',
        national_number: '',
        address: '',
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (isEditing) {
                setData({
                    name: customer.name || '',
                    phone: customer.phone || '',
                    national_number: customer.national_number || '',
                    address: customer.address || '',
                });
            } else {
                reset();
            }
        }
    }, [isOpen, customer]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        if (!data.name.trim()) {
            setError('name', 'اسم العميل مطلوب');
            return;
        }

        if (isEditing) {
            put(route('customers.update', customer.id), {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        } else {
            post(route('customers.store', { redirect_back: redirectBack }), {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
            <div
                className="animate-in fade-in zoom-in-95 relative w-full max-w-md rounded-[24px] bg-white p-6 font-['Cairo'] shadow-2xl duration-200"
                dir="rtl"
            >
                <button
                    onClick={onClose}
                    className="absolute left-5 top-5 text-gray-400 transition-colors hover:text-gray-700"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>

                <h2 className="mb-6 mt-2 text-center text-[15px] font-bold text-gray-500">
                    {isEditing ? 'تعديل عميل' : 'اضافة عميل'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <FormInput
                        label="الاسم"
                        placeholder="مثال: مينا ايهاب"
                        required={true}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                    />
                    <FormInput
                        label="رقم التليفون"
                        placeholder="مثال: 0123456789"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        error={errors.phone}
                    />
                    <FormInput
                        label="الرقم القومي"
                        placeholder="مثال: 350101272419"
                        value={data.national_number}
                        onChange={(e) =>
                            setData('national_number', e.target.value)
                        }
                        error={errors.national_number}
                    />
                    <FormInput
                        label="العنوان"
                        placeholder="الأقصر - ارمنت"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        error={errors.address}
                    />

                    <div className="mb-2 mt-8 flex items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-32 rounded-full border border-gray-400 px-8 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50"
                        >
                            الغاء
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="min-w-[130px] whitespace-nowrap rounded-full bg-black px-6 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-gray-800 disabled:opacity-50"
                        >
                            {processing
                                ? 'جاري...'
                                : isEditing
                                  ? 'تعديل العميل'
                                  : 'اضافة العميل'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
