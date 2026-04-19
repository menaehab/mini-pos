import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

const FormInput = ({ label, placeholder, type = "text", required = false, value, onChange, error }) => (
    <div className="mb-4 text-right">
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input 
            type={type} 
            placeholder={placeholder} 
            value={value} 
            onChange={onChange} 
            className={`w-full px-4 py-2 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'} rounded-2xl focus:outline-none focus:ring-1 text-sm text-right placeholder:text-gray-400`} 
            dir="rtl" 
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

export default function SupplierModal({ isOpen, onClose, supplier = null }) {
    const { __ } = useTranslation();
    const isEditing = !!supplier;

    const { data, setData, post, put, processing, errors, reset, clearErrors, setError } = useForm({
        name: '',
        phone: '',
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (isEditing) {
                setData({
                    name: supplier.name || '',
                    phone: supplier.phone || '',
                });
            } else {
                reset();
            }
        }
    }, [isOpen, supplier]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();

        if (!data.name.trim()) {
            setError('name', __('keywords.name_required') || 'الاسم مطلوب');
            return;
        }

        if (isEditing) {
            put(route('suppliers.update', supplier.id), {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        } else {
            post(route('suppliers.store'), {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-[24px] w-full max-w-md p-6 relative shadow-2xl font-['Cairo'] animate-in fade-in zoom-in-95 duration-200" dir="rtl">
                
                <button onClick={onClose} className="absolute top-5 left-5 text-gray-400 hover:text-gray-700 transition-colors">
                    <X size={20} strokeWidth={2.5} />
                </button>

                <h2 className="text-center text-[15px] font-bold text-gray-500 mb-6 mt-2">
                    {isEditing ? __('keywords.edit') + ' ' + __('keywords.supplier') : __('keywords.add') + ' ' + __('keywords.supplier')}
                </h2>

                <form onSubmit={handleSubmit}>
                    <FormInput label={__('keywords.name')} placeholder="مثال: مينا ايهاب" required={true} value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} />
                    <FormInput label="رقم التليفون" placeholder="مثال: 0123456789" required={true} value={data.phone} onChange={e => setData('phone', e.target.value)} error={errors.phone} />

                    <div className="flex items-center justify-center gap-4 mt-8 mb-2">
                        <button type="button" onClick={onClose} className="px-8 py-2.5 rounded-full border border-gray-400 text-gray-700 hover:bg-gray-50 transition-all text-sm font-bold w-32">
                            {__('keywords.cancel')}
                        </button>
                        <button type="submit" disabled={processing} className="px-8 py-2.5 rounded-full bg-black text-white hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm font-bold w-32 shadow-md">
                            {processing ? __('keywords.loading_short') : (isEditing ? __('keywords.save') : __('keywords.add') + ' ' + __('keywords.supplier'))}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}