import { usePermissions } from '@/hooks/usePermissions';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

const ICONS_PATH = '/Solve X';

const menuItems = [
    {
        name: 'الصفحة الرئيسية',
        icon: `${ICONS_PATH}/solar_home-2-outline.svg`,
        route: 'home',
    },
    {
        name: 'الأقسام',
        icon: `${ICONS_PATH}/fluent-mdl2_sections.svg`,
        route: 'categories.index',
        requiredPermissions: ['view_categories', 'manage_categories'],
    },
    {
        name: 'المنتجات',
        icon: `${ICONS_PATH}/qlementine-icons_items-list-16.svg`,
        route: 'products.index',
        requiredPermissions: ['view_products', 'manage_products'],
    },
    {
        name: 'الموردين',
        icon: `${ICONS_PATH}/solar_user-outline.svg`,
        route: 'suppliers.index',
        requiredPermissions: ['view_suppliers', 'manage_suppliers'],
    },
    {
        name: 'العملاء',
        icon: `${ICONS_PATH}/oui_users.svg`,
        route: 'customers.index',
        requiredPermissions: ['view_customers', 'manage_customers'],
    },
    {
        name: 'اذن التوريد',
        icon: `${ICONS_PATH}/ion_receipt-outline.svg`,
        route: 'customer-payments.index',
        requiredPermissions: [
            'view_customer_payments',
            'manage_customer_payments',
        ],
    },
    {
        name: 'اذن الصرف',
        icon: `${ICONS_PATH}/streamline_payment-10.svg`,
        route: 'supplier-payments.index',
        requiredPermissions: [
            'view_supplier_payments',
            'manage_supplier_payments',
        ],
    },
    {
        name: 'المبيعات',
        icon: `${ICONS_PATH}/icon-park-outline_sales-report.svg`,
        route: 'sales.index',
        requiredPermissions: ['view_sales', 'manage_sales'],
    },
    {
        name: 'مرتجع المبيعات',
        icon: `${ICONS_PATH}/lsicon_sales-return-outline.svg`,
        route: 'sale-returns.index',
        requiredPermissions: ['view_sales', 'manage_sales'],
    },
    {
        name: 'المشتريات',
        icon: `${ICONS_PATH}/tdesign_money.svg`,
        route: 'purchases.index',
        requiredPermissions: ['view_purchases', 'manage_purchases'],
    },
    {
        name: 'الأحصائيات',
        icon: `${ICONS_PATH}/uil_statistics.svg`,
        route: 'dashboard',
        requiredPermissions: ['view_dashboard'],
    },
];

export default function Sidebar({ isOpen, onClose = () => {} }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const { canAny } = usePermissions();

    const getSafeRoute = (routeName) => {
        try {
            return route().has(routeName) ? route(routeName) : '#';
        } catch {
            return '#';
        }
    };

    const isRouteActive = (routeName) => {
        try {
            return (
                route().current(routeName) ||
                route().current(`${routeName.split('.')[0]}.*`)
            );
        } catch {
            return false;
        }
    };

    const handleItemClick = () => {
        onClose();
    };

    const visibleMenuItems = menuItems.filter((item) => {
        if (!item.requiredPermissions) return true;
        return canAny(item.requiredPermissions);
    });

    const canAccessUsers = canAny(['view_users', 'manage_users']);
    const isUsersActive = isRouteActive('users.index');

    return (
        <aside
            className={`fixed right-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-64 shrink-0 flex-col border-l border-gray-100 bg-gray-200 font-['Cairo'] shadow-xl transition-all duration-300 md:relative md:top-0 md:h-full md:translate-x-0 md:shadow-none ${
                isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
            } ${isExpanded ? 'md:w-64' : 'md:w-[88px]'}`}
        >
            <button
                onClick={() => setIsExpanded((current) => !current)}
                className={`absolute top-8 z-20 hidden h-7 w-7 items-center justify-center rounded-full bg-black text-white shadow transition-all duration-300 hover:bg-gray-800 md:flex ${
                    isExpanded
                        ? 'left-10 top-4 -translate-x-1/2'
                        : 'left-[30px] top-[10px]'
                }`}
                aria-label="Toggle Sidebar"
                type="button"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-4 w-4 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : 'rotate-0'
                    }`}
                >
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>

            <nav className="mt-6 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-1 py-6">
                {visibleMenuItems.map((item) => {
                    const isActive = isRouteActive(item.route);

                    return (
                        <Link
                            key={item.name}
                            href={getSafeRoute(item.route)}
                            onClick={handleItemClick}
                            className={`group flex items-center rounded-lg font-medium transition-all duration-300 ${
                                isActive
                                    ? 'bg-black text-white shadow-md'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-[#1b2b20]'
                            } ${
                                isExpanded
                                    ? 'justify-start gap-4 px-4 py-2.5'
                                    : 'justify-center py-3'
                            }`}
                            title={!isExpanded ? item.name : undefined}
                        >
                            <img
                                src={item.icon}
                                alt={item.name}
                                className={`h-[20px] w-[20px] flex-shrink-0 object-contain transition-all duration-300 ${
                                    isActive
                                        ? 'invert filter opacity-100'
                                        : 'opacity-70 group-hover:opacity-100'
                                }`}
                            />
                            <span
                                className={`overflow-hidden whitespace-nowrap text-sm transition-all duration-300 ${
                                    isExpanded
                                        ? 'w-auto opacity-100'
                                        : 'w-0 opacity-0'
                                }`}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            <div
                className={`flex flex-col gap-2 p-4 transition-all ${
                    isExpanded ? 'items-stretch' : 'items-center'
                }`}
            >
                {canAccessUsers && (
                    <Link
                        href={getSafeRoute('users.index')}
                        onClick={handleItemClick}
                        className={`group flex items-center rounded-lg font-medium transition-all duration-300 ${
                            isUsersActive
                                ? 'bg-black text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-[#1b2b20]'
                        } ${
                            isExpanded
                                ? 'w-full justify-start gap-4 px-4 py-2.5'
                                : 'justify-center py-3'
                        }`}
                        title={!isExpanded ? 'المستخدمين' : undefined}
                    >
                        <img
                            src={`${ICONS_PATH}/oui_users.svg`}
                            alt="المستخدمين"
                            className={`h-[20px] w-[20px] flex-shrink-0 object-contain transition-all duration-300 ${
                                isUsersActive
                                    ? 'invert filter opacity-100'
                                    : 'opacity-70 group-hover:opacity-100'
                            }`}
                        />
                        <span
                            className={`overflow-hidden whitespace-nowrap text-sm transition-all duration-300 ${
                                isExpanded
                                    ? 'w-auto opacity-100'
                                    : 'hidden w-0 opacity-0'
                            }`}
                        >
                            المستخدمين
                        </span>
                    </Link>
                )}

                <Link
                    href={getSafeRoute('logout')}
                    method="post"
                    as="button"
                    onClick={handleItemClick}
                    className={`group flex items-center rounded-lg text-red-500 transition-colors hover:bg-red-50 ${
                        isExpanded
                            ? 'w-full justify-start gap-4 px-4 py-2.5'
                            : 'justify-center py-3'
                    }`}
                    title={!isExpanded ? 'تسجيل الخروج' : undefined}
                >
                    <img
                        src={`${ICONS_PATH}/mdi_logout.svg`}
                        alt="تسجيل الخروج"
                        className="h-[20px] w-[20px] flex-shrink-0 object-contain"
                    />
                    <span
                        className={`overflow-hidden whitespace-nowrap text-right text-sm font-medium transition-all duration-300 ${
                            isExpanded
                                ? 'w-auto opacity-100'
                                : 'hidden w-0 opacity-0'
                        }`}
                    >
                        تسجيل الخروج
                    </span>
                </Link>
            </div>
        </aside>
    );
}