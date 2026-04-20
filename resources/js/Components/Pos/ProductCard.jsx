import useTranslation from '@/hooks/useTranslation';

export default function ProductCard({ product, onAddToCart }) {
    const { __ } = useTranslation();

    const isOutOfStock = product.stock <= 0;

    return (
        <div
            onClick={() => !isOutOfStock && onAddToCart(product)}
            className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:border-black/10 hover:shadow-xl ${isOutOfStock ? 'cursor-not-allowed opacity-60 grayscale' : ''}`}
        >
            <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                    <span className="rounded-lg bg-gray-50 px-2 py-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                        {product.category?.name || __('keywords.uncategorized')}
                    </span>
                    <span
                        className={`rounded-lg px-2 py-1 text-xs font-bold ${product.stock <= 5 ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500'}`}
                    >
                        {product.stock} {__('keywords.piece')}
                    </span>
                </div>
                <h3 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-bold leading-relaxed text-gray-800 transition-colors group-hover:text-black">
                    {product.name}
                </h3>
                <div className="mt-2 flex items-end justify-between border-t border-gray-50 pt-3">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400">
                            {__('keywords.price')}
                        </span>
                        <span className="text-lg font-black text-black">
                            {product.sale_price}{' '}
                            <span className="text-[10px] font-bold text-gray-400">
                                {__('keywords.currency')}
                            </span>
                        </span>
                    </div>
                    {!isOutOfStock && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white shadow-md transition-transform group-hover:scale-105 group-active:scale-95">
                            <span className="mb-0.5 text-lg font-black leading-none">
                                +
                            </span>
                        </div>
                    )}
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
