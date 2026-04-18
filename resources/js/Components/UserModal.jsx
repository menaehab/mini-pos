import React from 'react';
import { X } from 'lucide-react';

// مكون فرعي لترتيب حقول الإدخال
const FormInput = ({ label, placeholder, type = "text", required = true }) => (
    <div className="mb-4 text-right">
        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm text-right placeholder:text-gray-400"
            dir="rtl"
        />
    </div>
);

export default function UserModal({ isOpen, onClose, onSubmit }) {
    // إذا كانت الحالة isOpen تساوي false، لا تقم بعرض أي شيء (null)
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // يمكنك لاحقاً جمع البيانات هنا وتمريرها لدالة onSubmit
        if(onSubmit) onSubmit(); 
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-[24px] w-full max-w-md p-6 relative shadow-2xl font-['Cairo'] animate-in fade-in zoom-in-95 duration-200" dir="rtl">
                
                {/* زر الإغلاق */}
                <button
                    onClick={onClose}
                    className="absolute top-5 left-5 text-gray-400 hover:text-gray-700 transition-colors"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>

                <h2 className="text-center text-lg font-bold text-gray-800 mb-6 mt-2">
                    اضافة مستخدم
                </h2>

                {/* النموذج */}
                <form onSubmit={handleSubmit}>
                    <FormInput label="اسم" placeholder="مثال: مينا ايهاب" />
                    <FormInput label="الدور" placeholder="مثال: ادمن" />
                    <FormInput label="البريد الالكتروني" placeholder="test@test.com" type="email" />
                    <FormInput label="كلمة المرور" placeholder="*************" type="password" />
                    <FormInput label="تاكيد كلمة المرور" placeholder="*************" type="password" />

                    {/* الأزرار */}
                    <div className="flex items-center justify-center gap-4 mt-8 mb-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-2.5 rounded-full border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-bold w-32"
                        >
                            الغاء
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2.5 rounded-full bg-black text-white hover:bg-gray-800 transition-colors text-sm font-bold w-32 shadow-md"
                        >
                            التالي
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}