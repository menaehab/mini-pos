import React from 'react';
import { X, Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, userName, processing = false }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-[24px] w-full max-w-sm p-6 relative shadow-2xl font-['Cairo'] animate-in fade-in zoom-in-95 duration-200" dir="rtl">

                <button onClick={onClose} className="absolute top-5 left-5 text-gray-400 hover:text-gray-700 transition-colors">
                    <X size={20} strokeWidth={2.5} />
                </button>

                <div className="flex flex-col items-center text-center mt-2 mb-6">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                        <Trash2 size={26} className="text-red-500" strokeWidth={2} />
                    </div>
                    <h2 className="text-[16px] font-bold text-gray-800 mb-1">تأكيد الحذف</h2>
                    <p className="text-sm text-gray-500">
                        هل أنت متأكد من حذف المستخدم
                        <span className="font-bold text-gray-700"> "{userName}"</span>؟
                    </p>
                    <p className="text-xs text-red-400 mt-1">لا يمكن التراجع عن هذا الإجراء</p>
                </div>

                <div className="flex items-center justify-center gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-2.5 rounded-full border border-gray-400 text-gray-700 hover:bg-gray-50 transition-all text-sm font-bold w-32"
                    >
                        الغاء
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className="px-8 py-2.5 rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors text-sm font-bold w-32 shadow-md"
                    >
                        {processing ? 'جاري...' : 'حذف'}
                    </button>
                </div>
            </div>
        </div>
    );
}
