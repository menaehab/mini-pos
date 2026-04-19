import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';

const FormInput = ({ label, placeholder, type = "text", required = true, value, onChange, error }) => (
    <div className="mb-4 text-right">
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input type={type} placeholder={placeholder} value={value} onChange={onChange} className={`w-full px-4 py-2 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-black focus:ring-black'} rounded-2xl focus:outline-none focus:ring-1 text-sm text-right placeholder:text-gray-400`} dir="rtl" />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

export default function UserModal({ isOpen, onClose, user = null, permissions = [] }) {
    const [step, setStep] = useState(1);

    const isEditing = !!user; 

    const { data, setData, post, put, processing, errors, reset, clearErrors, setError } = useForm({
        name: '',
        role: '',
        email: '',
        password: '',
        password_confirmation: '',
        permissions: [],
    });

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            clearErrors();
            
            if (isEditing) {
                const userPermissionNames = (user.permissions || []).map(p =>
                    typeof p === 'string' ? p : p.name
                );
                setData({
                    name: user.name || '',
                    role: user.role || '',
                    email: user.email || '',
                    password: '',
                    password_confirmation: '',
                    permissions: userPermissionNames,
                });
            } else {       
                reset();
            }
        }
    }, [isOpen, user]); 

    if (!isOpen) return null;

    const handleNextStep = (e) => {
        e.preventDefault();
        
        let currentErrors = {};

        if (!data.name.trim()) currentErrors.name = 'الاسم مطلوب';
        if (!isEditing && !data.role.trim()) currentErrors.role = 'الدور مطلوب';
        if (!data.email.trim()) currentErrors.email = 'البريد الالكتروني مطلوب';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) currentErrors.email = 'صيغة البريد الالكتروني غير صحيحة';

        if (!isEditing) {
            if (!data.password) {
                currentErrors.password = 'كلمة المرور مطلوبة';
            } else if (data.password.length < 6) { 
                currentErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
            }
            if (data.password !== data.password_confirmation) {
                currentErrors.password_confirmation = 'كلمة المرور غير متطابقة';
            }
        } else {
            if (data.password && data.password !== data.password_confirmation) {
                currentErrors.password_confirmation = 'كلمة المرور غير متطابقة';
            }
        }

        if (Object.keys(currentErrors).length > 0) {
            clearErrors();
            for (const field in currentErrors) {
                setError(field, currentErrors[field]); 
            }
            return; 
        }

        clearErrors();
        setStep(2);
    };

    const handleFinalSubmit = (e) => {
        e.preventDefault();
        
       if (isEditing) {
            put(route('users.update', user.id), {
                preserveScroll: true,
                onSuccess: () => onClose(),
                onError: () => setStep(1)
            });
        } else {
            post(route('users.store'), {
                preserveScroll: true,
                onSuccess: () => onClose(),
                onError: () => setStep(1)
            });
        }
    };

    const togglePermission = (permission) => {
        let updatedPermissions = [...data.permissions];
        if (updatedPermissions.includes(permission)) {
            updatedPermissions = updatedPermissions.filter(p => p !== permission);
        } else {
            updatedPermissions.push(permission);
        }
        setData('permissions', updatedPermissions);
    };

    const permissionsList = permissions;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-[24px] w-full max-w-md p-6 relative shadow-2xl font-['Cairo'] animate-in fade-in zoom-in-95 duration-200" dir="rtl">
                
                <button onClick={onClose} className="absolute top-5 left-5 text-gray-400 hover:text-gray-700 transition-colors">
                    <X size={20} strokeWidth={2.5} />
                </button>

               
                <h2 className="text-center text-[15px] font-bold text-gray-500 mb-6 mt-2">
                    {isEditing ? 'تعديل مستخدم' : 'اضافة مستخدم'}
                </h2>

                {step === 1 && (
                    <form onSubmit={handleNextStep}>
                        <FormInput label="اسم" placeholder="مثال: مينا ايهاب" value={data.name} onChange={e => setData('name', e.target.value)} error={errors.name} />
                        <FormInput label="الدور" placeholder="مثال: ادمن" required={!isEditing} value={data.role} onChange={e => setData('role', e.target.value)} error={errors.role} />
                        <FormInput label="البريد الالكتروني" placeholder="test@test.com" type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} />
                        
                        <FormInput label="كلمة المرور" placeholder={isEditing ? "اتركه فارغاً إذا لم ترد تغييره" : "*************"} type="password" required={!isEditing} value={data.password} onChange={e => setData('password', e.target.value)} error={errors.password} />
                        <FormInput label="تاكيد كلمة المرور" placeholder={isEditing ? "اتركه فارغاً إذا لم ترد تغييره" : "*************"} type="password" required={!isEditing} value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} />

                        <div className="flex items-center justify-center gap-4 mt-8 mb-2">
                            <button type="button" onClick={onClose} className="px-8 py-2.5 rounded-full border border-gray-400 text-gray-700 hover:bg-gray-50 transition-all text-sm font-bold w-32">
                                الغاء
                            </button>
                            <button type="submit" className="px-8 py-2.5 rounded-full bg-black text-white hover:bg-gray-800 transition-colors text-sm font-bold w-32 shadow-md">
                                التالي
                            </button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleFinalSubmit} className="flex flex-col h-full">
                        <div className="text-right mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mr-4">الصلاحيات</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 mb-10 w-full px-6" dir="rtl">
                            {permissionsList.map((perm, index) => (
                                <label key={index} className="flex items-center justify-end gap-3 cursor-pointer group">
                                    <span className="text-[13px] font-semibold text-gray-700 select-none group-hover:text-black transition-colors">
                                        {perm}
                                    </span>
                                    <div className="relative flex items-center justify-center">
                                        <input 
                                            type="checkbox" 
                                            className="peer appearance-none w-[18px] h-[18px] border-2 border-gray-300 rounded-[4px] cursor-pointer checked:bg-black checked:border-black transition-colors"
                                            checked={data.permissions.includes(perm)}
                                            onChange={() => togglePermission(perm)}
                                        />
                                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {errors.permissions && <p className="text-red-500 text-xs text-center mb-2">{errors.permissions}</p>}

                        <div className="flex items-center justify-center gap-4 mt-auto mb-2">
                            <button type="button" onClick={() => setStep(1)} className="px-8 py-2.5 rounded-full border border-gray-400 text-gray-700 hover:bg-gray-50 transition-all text-sm font-bold w-32">
                                السابق
                            </button>
                            <button type="submit" disabled={processing} className="px-8 py-2.5 rounded-full bg-black text-white hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm font-bold w-32 shadow-md">
                                {processing ? 'جاري...' : 'حفظ'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}