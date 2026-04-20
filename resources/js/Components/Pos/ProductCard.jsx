import useTranslation from '@/hooks/useTranslation';
import { Package } from 'lucide-react';

export default function ProductCard({ product, onAddToCart }) {
    const { __ } = useTranslation();

    const isOutOfStock = product.stock <= 0;

    return (
        <div
            onClick={() => !isOutOfStock && onAddToCart(product)}
            className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:border-black/10 hover:shadow-xl ${isOutOfStock ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
        >
            <div className="mb-3 flex h-24 items-center justify-center rounded-xl bg-gray-50 transition-colors group-hover:bg-gray-100">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover rounded-xl"
                    />
                ) : (
                    <Package className="text-gray-300" size={32} />
                )}
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {product.category?.name || __('keywords.uncategorized')}
                </span>
                <h3 className="line-clamp-1 font-bold text-gray-800 transition-colors group-hover:text-black">
                    {product.name}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-black text-black">
                        {product.sale_price} <span className="text-[10px] font-bold text-gray-400">{__('keywords.currency')}</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${product.stock <= 5 ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500'}`}>
                        {product.stock} {__('keywords.piece')}
                    </span>
                </div>
            </div>

            {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
                    <span className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-bold text-white shadow-lg">
                        {__('keywords.out_of_stock')}
                    </span>
                </div>
            )}
        </div>
    );
}
