import React, { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head } from '@inertiajs/react';
import { Search } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation'; 

export default function Home() {
    const { __ } = useTranslation(); 
    
    const showAllText = __('keywords.show_all');

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(showAllText);
    const [cart, setCart] = useState([]); 
    
   const categories = [showAllText, 'قطن', 'قماش', 'زراير'];
    const dummyProducts = [
        { id: 1, name: 'قطن مصري ممتاز', category: 'قطن', price: 150 },
        { id: 2, name: 'قماش حرير', category: 'قماش', price: 300 },
        { id: 3, name: 'زراير بلاستيك', category: 'زراير', price: 50 },
        { id: 4, name: 'قطن طبي', category: 'قطن', price: 100 },
        { id: 5, name: 'قماش كتان', category: 'قماش', price: 200 },
    ];
    
    const filteredProducts = dummyProducts.filter(product => {
        const matchesCategory = activeCategory === showAllText || product.category === activeCategory;
        const matchesSearch = product.name.includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    return (
        <>
            <Head title={__('keywords.pos')} />
            
            <div className="relative mx-auto max-w-7xl font-['Cairo'] h-[calc(100vh-100px)] flex flex-col" dir="rtl">
                
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">{__('keywords.pos')}</h1>
                </div>
                
                <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
               
                    <div className="flex-1 flex flex-col overflow-hidden">
                        
                
                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder={__('keywords.search_pos')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 py-3 pl-4 pr-12 text-right focus:border-black focus:outline-none focus:ring-1 focus:ring-black shadow-sm"
                            />
                            <Search className="absolute right-4 top-3.5 text-gray-400" size={20} />
                        </div>

                
                        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-6 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${
                                        activeCategory === cat 
                                        ? 'bg-black text-white shadow-md' 
                                        : 'bg-transparent text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                  
                        <div className="flex-1 overflow-y-auto pr-1">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                                {filteredProducts.map((product) => (
                                    <div 
                                        key={product.id}
                                        onClick={() => console.log('اضافة للسلة:', product.name)}
                                        className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md hover:border-gray-200 transition-all h-32"
                                    >
                                        <span className="font-bold text-gray-800 mb-2">{product.name}</span>
                                        <span className="text-sm text-gray-500">{product.price} {__('keywords.currency')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                   
                    <div className="w-full lg:w-[350px] bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-full">
                        
                   
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="font-bold text-gray-800">{__('keywords.current_invoice')}</h2>
                        </div>

                  
                        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-gray-50/30">
                            {cart.length === 0 ? (
                                <p className="text-gray-400 font-semibold text-sm">{__('keywords.items_count')} (0)</p>
                            ) : (
                                <div className="w-full h-full">
                  
                                </div>
                            )}
                        </div>

                  
                        <div className="bg-gray-50 border-t border-gray-200 p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-semibold">{__('keywords.subtotal')}</span>
                                <span className="text-gray-400 font-bold">0.00 {__('keywords.currency')}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-800 font-bold">{__('keywords.invoice_total')}</span>
                                <span className="text-gray-800 font-bold">0.00 {__('keywords.currency')}</span>
                            </div>
                            
                            <hr className="border-gray-200 my-1" />
                            
                            <div className="flex justify-between items-center text-md mb-2">
                                <span className="text-gray-800 font-bold">{__('keywords.amount_due')}</span>
                                <span className="text-gray-800 font-bold">0.00 {__('keywords.currency')}</span>
                            </div>

                            <button className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-md">
                                {__('keywords.pay')}
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </>
    );
}

Home.layout = (page) => <MainLayout>{page}</MainLayout>;