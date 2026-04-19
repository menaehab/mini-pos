import { Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    userName,
    entityName = "المستخدم",
    processing = false,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
            <div
                className="animate-in fade-in zoom-in-95 relative w-full max-w-sm rounded-[24px] bg-white p-6 font-['Cairo'] shadow-2xl duration-200"
                dir="rtl"
            >
                <button
                    onClick={onClose}
                    className="absolute left-5 top-5 text-gray-400 transition-colors hover:text-gray-700"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>

                <div className="mb-6 mt-2 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                        <Trash2
                            size={26}
                            className="text-red-500"
                            strokeWidth={2}
                        />
                    </div>
                    <h2 className="mb-1 text-[16px] font-bold text-gray-800">
                        تأكيد الحذف
                    </h2>
                    <p className="text-sm text-gray-500">
                        هل أنت متأكد من حذف {entityName}
                        <span className="font-bold text-gray-700">
                            {' '}
                            "{userName}"
                        </span>
                        ؟
                    </p>
                    <p className="mt-1 text-xs text-red-400">
                        لا يمكن التراجع عن هذا الإجراء
                    </p>
                </div>

                <div className="flex items-center justify-center gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-32 rounded-full border border-gray-400 px-8 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50"
                    >
                        الغاء
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className="w-32 rounded-full bg-red-500 px-8 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-red-600 disabled:opacity-50"
                    >
                        {processing ? 'جاري...' : 'حذف'}
                    </button>
                </div>
            </div>
        </div>
    );
}
