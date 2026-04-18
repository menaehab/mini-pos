import { Bell, Menu } from 'lucide-react';

export default function Navbar({ isSidebarOpen, onMenuClick }) {
    return (
        <header className="flex h-16 w-full shrink-0 items-center justify-between bg-black px-4 md:px-6">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 md:hidden"
                    aria-label={isSidebarOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                    aria-expanded={isSidebarOpen}
                >
                    <Menu size={22} />
                </button>

                <img
                    src="logo_1.png"
                    alt="Solvex Sales System"
                    className="w-28 md:w-32"
                    width="194"
                />
            </div>

            <div className="flex items-center gap-4">
                <button className="relative text-white hover:text-gray-300">
                    <Bell size={20} />
                    <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] text-white">
                        1
                    </span>
                </button>
            </div>
        </header>
    );
}
