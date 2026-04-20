import useTranslation from '@/hooks/useTranslation';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
    const { __ } = useTranslation();

    return (
        <div className="group flex items-center gap-4 rounded-2xl bg-white p-3 border border-transparent transition-all hover:border-gray-100 hover:shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-50 shrink-0">
                <span className="text-xl font-bold text-gray-400">#</span>
            </div>

            <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                <h4 className="line-clamp-1 font-bold text-gray-800 text-sm">
                    {item.name}
                </h4>
                <span className="text-xs font-semibold text-gray-400">
                    {item.sale_price} {__('keywords.currency')}
                </span>
            </div>

            <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-1">
                    <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-gray-600 shadow-sm transition-colors hover:text-black"
                    >
                        <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-gray-800">
                        {item.quantity}
                    </span>
                    <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-gray-600 shadow-sm transition-colors hover:text-black"
                        disabled={item.quantity >= item.stock}
                    >
                        <Plus size={14} />
                    </button>
                </div>
                
                <button
                    onClick={() => onRemove(item.id)}
                    className="text-red-300 transition-colors hover:text-red-500 opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}
