import { useState } from 'react';

import Sidebar from '@/Components/SideBar';
import Navbar from '../Components/Navbar';

export default function MainLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleToggleSidebar = () => {
        setIsSidebarOpen((current) => !current);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div
            className="flex h-screen flex-col bg-white font-['Cairo']"
            dir="rtl"
        >
            <Navbar
                isSidebarOpen={isSidebarOpen}
                onMenuClick={handleToggleSidebar}
            />
            <div className="relative flex flex-1 overflow-hidden">
                <div
                    className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 md:hidden ${
                        isSidebarOpen
                            ? 'pointer-events-auto opacity-100'
                            : 'pointer-events-none opacity-0'
                    }`}
                    onClick={handleCloseSidebar}
                    aria-hidden="true"
                />
                <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
