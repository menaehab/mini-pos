import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

const ICONS_PATH = '/Solve X';

const menuItems = [
    { name: 'الصفحة الرئيسية', icon: `${ICONS_PATH}/solar_home-2-outline.svg`, route: 'home' },
    { name: 'المبيعات', icon: `${ICONS_PATH}/icon-park-outline_sales-report.svg`, route: 'sales' },
    { name: 'مرتجع المبيعات', icon: `${ICONS_PATH}/lsicon_sales-return-outline.svg`, route: 'sales.returns' },
    { name: 'إذن التوريد', icon: `${ICONS_PATH}/ion_receipt-outline.svg`, route: 'supply.orders' },
    { name: 'المشتريات', icon: `${ICONS_PATH}/tdesign_money.svg`, route: 'purchases' },
    { name: 'مرتجع المشتريات', icon: `${ICONS_PATH}/game-icons_back-forth.svg`, route: 'purchases.returns' },
    { name: 'إذن الصرف', icon: `${ICONS_PATH}/ion_receipt-outline.svg`, route: 'exchange.orders' },
    { name: 'الأقسام', icon: `${ICONS_PATH}/qlementine-icons_items-list-16.svg`, route: 'departments' },
    { name: 'المنتجات', icon: `${ICONS_PATH}/qlementine-icons_items-list-16.svg`, route: 'products' },
    { name: 'المصروفات', icon: `${ICONS_PATH}/streamline_payment-10.svg`, route: 'expenses' },
    { name: 'الإحصائيات', icon: `${ICONS_PATH}/icon-park-outline_sales-report.svg`, route: 'statistics' },
    { name: 'الموردين', icon: `${ICONS_PATH}/oui_users.svg`, route: 'suppliers' },
    { name: 'العملاء', icon: `${ICONS_PATH}/solar_user-outline.svg`, route: 'customers' },
];

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(true);

    const getSafeRoute = (routeName) => {
        try {
            return route().has(routeName) ? route(routeName) : '#';
        } catch {
            return '#';
        }
    };

    return (
        <aside 
            className={`bg-white flex flex-col h-full shrink-0 font-['Cairo'] transition-all duration-300 relative ${
                isExpanded ? 'w-64' : 'w-[88px]' // عرض أوسع قليلاً في حالة الطي ليتسع للزر
            }`}
        >
            {/* زر الطي والتوسيع */}
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`absolute top-8 w-7 h-7 bg-black rounded-full flex items-center justify-center text-white z-20 shadow cursor-pointer hover:bg-gray-800 transition-all duration-300 ${
                    isExpanded ? 'left-0 -translate-x-1/2' :  'left-[30px] top-[-1px]'
                }`}
                aria-label="Toggle Sidebar"
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                >
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>

            {/* محتوى الروابط العلوية */}
            <nav className="flex-1 overflow-y-auto py-6 space-y-1 mt-6 overflow-x-hidden px-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={getSafeRoute(item.route)}
                        className={`flex items-center text-gray-700 hover:bg-gray-50 hover:text-[#1b2b20] transition-colors font-medium group rounded-lg ${
                            isExpanded ? 'px-4 py-2.5 gap-4 justify-start' : 'justify-center py-3'
                        }`}
                        title={!isExpanded ? item.name : undefined}
                    >
                        <img 
                            src={item.icon} 
                            alt={item.name} 
                            className="w-[20px] h-[20px] object-contain opacity-70 group-hover:opacity-100 flex-shrink-0" 
                        />
                        <span className={`text-sm whitespace-nowrap transition-all duration-300 overflow-hidden ${
                            isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                        }`}>
                            {item.name}
                        </span>
                    </Link>
                ))}
            </nav>

            {/* الأزرار السفلية (تم ضبط الـ Padding والمحاذاة لتطابق القائمة العلوية) */}
            <div className={`p-4 flex flex-col gap-2 transition-all ${isExpanded ? 'items-stretch' : 'items-center'}`}>
                
                {/* زر المستخدمين */}
                <Link 
                    href={getSafeRoute('users.index')} 
                    className={`flex items-center text-white bg-black hover:bg-gray-800 transition-colors ${
                        isExpanded ? 'px-4 py-2.5 gap-4 rounded-lg w-full justify-start' : 'p-3 justify-center w-[48px] h-[48px] rounded-full'
                    }`}
                    title={!isExpanded ? 'المستخدمين' : undefined}
                >
                    <img 
                        src={`${ICONS_PATH}/oui_users.svg`} 
                        alt="المستخدمين" 
                        className="w-[20px] h-[20px] object-contain filter invert flex-shrink-0" 
                    />
                    <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${
                        isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'
                    }`}>
                        المستخدمين
                    </span>
                </Link>

                {/* زر تسجيل الخروج */}
                <Link 
                    href={getSafeRoute('logout')} 
                    method="post" 
                    as="button" 
                    className={`flex items-center text-red-500 hover:bg-red-50 rounded-lg transition-colors ${
                        // عكسنا الترتيب ليصبح الأيقونة أولاً ثم النص مثل باقي القائمة
                        isExpanded ? 'px-4 py-2.5 gap-4 w-full justify-start' : 'p-3 justify-center w-[48px] h-[48px] rounded-full'
                    }`}
                    title={!isExpanded ? 'تسجيل الخروج' : undefined}
                >
                    <img 
                        src={`${ICONS_PATH}/mdi_logout.svg`} 
                        alt="تسجيل الخروج" 
                        className="w-[20px] h-[20px] object-contain flex-shrink-0" 
                    />
                    <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 overflow-hidden text-right ${
                        isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'
                    }`}>
                        تسجيل الخروج
                    </span>
                </Link>
            </div>
        </aside>
    );
}