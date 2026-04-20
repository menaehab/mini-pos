import useTranslation from '@/hooks/useTranslation';
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

export default function CategoryModal({ isOpen, onClose, category = null }) {
    const { __ } = useTranslation();
    const isEditing = !!category;

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
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (isEditing) {
                setData({
                    name: category.name || '',
                });
            } else {
                reset();
            }
        }
    }, [isOpen, category]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        if (!data.name.trim()) {
            setError('name', __('keywords.name_required') || 'الاسم مطلوب');
            return;
        }

        if (isEditing) {
            put(route('categories.update', category.id), {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        } else {
            post(route('categories.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    setData({
                        name: '',
                    });
                },
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
                    {isEditing
                        ? __('keywords.edit') + ' ' + __('keywords.category')
                        : __('keywords.add') + ' ' + __('keywords.category')}
                </h2>

                <form onSubmit={handleSubmit}>
                    <FormInput
                        label={__('keywords.name')}
                        placeholder="مثال: قطن"
                        required={true}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        error={errors.name}
                    />

                    <div className="mb-2 mt-8 flex items-center justify-center gap-4">
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
                                  : `${__('keywords.add')} ${__('keywords.category')}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
