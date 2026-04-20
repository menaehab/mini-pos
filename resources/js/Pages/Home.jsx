import CartItem from '@/Components/Pos/CartItem';
import CheckoutModal from '@/Components/Pos/CheckoutModal';
import ProductCard from '@/Components/Pos/ProductCard';
import useTranslation from '@/hooks/useTranslation';
import MainLayout from '@/Layouts/MainLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Search, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home({ categories, products: initialProducts }) {
    const { __ } = useTranslation();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [products, setProducts] = useState(initialProducts);
    const [cart, setCart] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [mobileTab, setMobileTab] = useState('products');

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(route('products.search'), {
                    params: {
                        search: searchQuery,
                        category_id:
                            activeCategory === 'all' ? null : activeCategory,
                        per_page: 16,
                    },
                });
                setProducts(response.data.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, activeCategory]);

    const addToCart = (product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) return prev;
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id, quantity) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        setCart((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
        );
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const subtotal = cart.reduce(
        (sum, item) => sum + item.sale_price * item.quantity,
        0,
    );

    return (
        <>
            <Head title={__('keywords.pos')} />

            <div
                className="relative mx-auto flex h-[calc(100vh-100px)] max-w-full flex-col gap-3 overflow-hidden p-4 font-['Cairo'] lg:flex-row lg:gap-6"
                dir="rtl"
            >
                {/* Mobile Tab Switcher */}
                <div className="flex gap-1 p-1 bg-gray-100 shrink-0 rounded-2xl lg:hidden">
                    <button
                        onClick={() => setMobileTab('products')}
                        className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${
                            mobileTab === 'products'
                                ? 'bg-white text-black shadow-sm'
                                : 'text-gray-500'
                        }`}
                    >
                        {__('keywords.products')}
                    </button>
                    <button
                        onClick={() => setMobileTab('cart')}
                        className={`relative flex-1 rounded-xl py-3 text-sm font-bold transition-all ${
                            mobileTab === 'cart'
                                ? 'bg-white text-black shadow-sm'
                                : 'text-gray-500'
                        }`}
                    >
                        {__('keywords.shopping_cart')}
                        {cart.length > 0 && (
                            <span className="absolute left-2 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-black text-white">
                                {cart.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Main Content: Products */}
                <div
                    className={`flex-1 flex-col overflow-hidden rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm ${
                        mobileTab === 'cart' ? 'hidden lg:flex' : 'flex'
                    }`}
                >
                    {/* Header: Search & Filter */}
                    <div className="flex flex-col gap-4 mb-6">
                        {/* Search */}
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder={__('keywords.search_products')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-4 pl-4 pr-12 text-right transition-all border-gray-100 rounded-2xl bg-gray-50/50 focus:border-black focus:ring-1 focus:ring-black"
                            />
                            <Search
                                className="absolute text-gray-400 right-4 top-4"
                                size={20}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex items-center gap-2 pb-2 overflow-x-auto scrollbar-hide">
                            <button
                                onClick={() => setActiveCategory('all')}
                                className={`whitespace-nowrap rounded-2xl px-6 py-3.5 text-sm font-bold transition-all ${
                                    activeCategory === 'all'
                                        ? 'scale-105 bg-black text-white shadow-xl'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                {__('keywords.all_categories')}
                            </button>

                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`whitespace-nowrap rounded-2xl px-6 py-3.5 text-sm font-bold transition-all ${
                                        activeCategory === cat.id
                                            ? 'scale-105 bg-black text-white shadow-xl'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1 pr-1 overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="w-12 h-12 border-4 border-black border-solid rounded-full animate-spin border-r-transparent" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                                <ShoppingBag
                                    size={64}
                                    strokeWidth={1}
                                    className="mb-4"
                                />
                                <span className="text-xl font-bold">
                                    {__('keywords.no_products_found')}
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 pb-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={addToCart}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Cart */}
                <div
                    className={`flex-col overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-lg lg:flex lg:w-[400px] ${
                        mobileTab === 'products'
                            ? 'hidden lg:flex'
                            : 'flex h-full'
                    }`}
                >
                    <div className="flex items-center justify-between p-6 border-b border-gray-50">
                        <h2 className="text-xl font-black text-gray-800">
                            {__('keywords.shopping_cart')}
                        </h2>
                        <span className="rounded-full bg-black px-3 py-1 text-[10px] font-black text-white">
                            {cart.length} {__('keywords.items')}
                        </span>
                    </div>

                    <div className="flex flex-col flex-1 gap-3 p-4 overflow-y-auto custom-scrollbar bg-gray-50/30">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 opacity-40">
                                <ShoppingBag size={48} className="mb-2" />
                                <p className="text-sm font-bold">
                                    {__('keywords.cart_is_empty')}
                                </p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    onUpdateQuantity={updateQuantity}
                                    onRemove={removeFromCart}
                                />
                            ))
                        )}
                    </div>

                    {/* Footer: Totals */}
                    <div className="flex flex-col gap-4 bg-white p-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-bold text-gray-400">
                                    {__('keywords.subtotal')}
                                </span>
                                <span className="font-black text-gray-600">
                                    {subtotal.toFixed(2)}{' '}
                                    {__('keywords.currency')}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <span className="text-lg font-black text-gray-800">
                                    {__('keywords.total')}
                                </span>
                                <span className="text-2xl font-black text-black">
                                    {subtotal.toFixed(2)}{' '}
                                    {__('keywords.currency')}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsCheckoutOpen(true)}
                            disabled={cart.length === 0}
                            className="flex items-center justify-center w-full gap-3 py-5 font-black text-white transition-all bg-black shadow-xl group rounded-2xl hover:bg-gray-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:grayscale"
                        >
                            <span>{__('keywords.checkout')}</span>
                        </button>
                    </div>
                </div>
            </div>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                cart={cart}
                total={subtotal}
            />
        </>
    );
}

Home.layout = (page) => <MainLayout>{page}</MainLayout>;
