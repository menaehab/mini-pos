import React from 'react';
import Navbar from '../Components/Navbar';
import Sidebar from '../Components/Sidebar';
import Index from '@/Pages';
    
export default function MainLayout({ children }) {
    return (
        // إضافة خط Cairo وتوجيه RTL
        <div className="flex flex-col h-screen bg-white font-['Cairo']" dir="rtl">
            {/* <Navbar /> */}
            <div className="flex flex-1 overflow-hidden">
                {/* <Sidebar />  */}
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}