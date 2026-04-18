import React from 'react';
import { Bell } from 'lucide-react';

export default function Navbar() {
    return (
        <header className="bg-black h-16 flex items-center justify-between px-6 w-full shrink-0">
            {/* يمين الشاشة: الشعار */}
            <div className="flex items-center">
                <img src="logo_1.png" alt="Solvex Sales System" className="w-32" width="194" />
            </div>

            {/* يسار الشاشة: الملف الشخصي والإشعارات */}
            <div className="flex items-center gap-4">
                <button className="relative text-white hover:text-gray-300">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] text-white">1</span>
                </button>
                <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-600">
                    <img src="account.png" alt="User Profile" className="h-full w-full object-cover" />
                </div>
            </div>
        </header>
    );
}