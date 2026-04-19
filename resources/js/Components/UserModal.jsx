import useTranslation from '@/hooks/useTranslation';
import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

const FormInput = ({
    label,
    placeholder,
    type = 'text',
    required = true,
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

export default function UserModal({
    isOpen,
    onClose,
    user = null,
    permissions = [],
}) {
    const { __ } = useTranslation();
    const [step, setStep] = useState(1);

    const isEditing = !!user;

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
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
                const userPermissionNames = (user.permissions || []).map((p) =>
                    typeof p === 'string' ? p : p.name,
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
        clearErrors();
        setStep(2);
    };

    const handleFinalSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('users.update', user.id), {
                preserveScroll: true,
                onSuccess: () => onClose(),
                onError: () => setStep(1),
            });
        } else {
            post(route('users.store'), {
                preserveScroll: true,
                onSuccess: () => onClose(),
                onError: () => setStep(1),
            });
        }
    };

    const togglePermission = (permission) => {
        let updatedPermissions = [...data.permissions];
        if (updatedPermissions.includes(permission)) {
            updatedPermissions = updatedPermissions.filter(
                (p) => p !== permission,
            );
        } else {
            updatedPermissions.push(permission);
        }
        setData('permissions', updatedPermissions);
    };

    const permissionsList = permissions;

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
                        ? __('keywords.edit_user')
                        : __('keywords.add_user')}
                </h2>

                {step === 1 && (
                    <form onSubmit={handleNextStep}>
                        <FormInput
                            label={__('keywords.name')}
                            placeholder={__('keywords.example_name')}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                        />
                        <FormInput
                            label={__('keywords.role')}
                            placeholder={__('keywords.example_role')}
                            required={!isEditing}
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            error={errors.role}
                        />
                        <FormInput
                            label={__('keywords.email_address')}
                            placeholder="test@test.com"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                        />

                        <FormInput
                            label={__('keywords.password')}
                            placeholder={
                                isEditing
                                    ? __('keywords.leave_blank_if_not_changing')
                                    : '*************'
                            }
                            type="password"
                            required={!isEditing}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            error={errors.password}
                        />
                        <FormInput
                            label={__('keywords.password_confirmation')}
                            placeholder={
                                isEditing
                                    ? __('keywords.leave_blank_if_not_changing')
                                    : '*************'
                            }
                            type="password"
                            required={!isEditing}
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            error={errors.password_confirmation}
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
                                className="w-32 rounded-full bg-black px-8 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-gray-800"
                            >
                                {__('keywords.next')}
                            </button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form
                        onSubmit={handleFinalSubmit}
                        className="flex h-full flex-col"
                    >
                        <div className="mb-8 text-right">
                            <h3 className="mr-4 text-xl font-bold text-gray-900">
                                {__('keywords.permissions')}
                            </h3>
                        </div>

                        <div
                            className="mb-10 grid w-full grid-cols-2 gap-y-4 px-6"
                            dir="rtl"
                        >
                            {permissionsList.map((perm, index) => (
                                <label
                                    key={index}
                                    className="group flex cursor-pointer items-center justify-end gap-3"
                                >
                                    <span className="select-none text-[13px] font-semibold text-gray-700 transition-colors group-hover:text-black">
                                        {__('keywords.' + perm)}
                                    </span>
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            className="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded-[4px] border-2 border-gray-300 transition-colors checked:border-black checked:bg-black"
                                            checked={data.permissions.includes(
                                                perm,
                                            )}
                                            onChange={() =>
                                                togglePermission(perm)
                                            }
                                        />
                                        <svg
                                            className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {errors.permissions && (
                            <p className="mb-2 text-center text-xs text-red-500">
                                {errors.permissions}
                            </p>
                        )}

                        <div className="mb-2 mt-auto flex items-center justify-center gap-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-32 rounded-full border border-gray-400 px-8 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50"
                            >
                                {__('keywords.previous')}
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-32 rounded-full bg-black px-8 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-gray-800 disabled:opacity-50"
                            >
                                {processing
                                    ? __('keywords.loading_short')
                                    : __('keywords.save')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
