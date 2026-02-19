import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    User,
    Store
} from 'lucide-react';
import { useState } from 'react';
import { auth } from '../../config/firebase';

export default function SellerLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/seller/dashboard' },
        { icon: Package, label: 'Products', path: '/seller/dashboard/products' },
        { icon: ShoppingBag, label: 'Orders', path: '/seller/dashboard/orders' },
        { icon: BarChart3, label: 'Analytics', path: '/seller/dashboard/analytics' },
        { icon: Settings, label: 'Settings', path: '/seller/dashboard/settings' },
    ];

    const handleLogout = async () => {
        try {
            await auth.signOut();
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-white border-r border-gray-200 sticky top-0 h-screen hidden md:flex flex-col`}>
                <div className="p-6 flex items-center gap-3 border-b border-gray-100">
                    <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-secondary/20">
                        S
                    </div>
                    {isSidebarOpen && <span className="font-bold text-xl tracking-tight">Seller Hub</span>}
                </div>

                <nav className="flex-1 p-4 space-y-1 mt-4">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path === '/seller/dashboard' && location.pathname === '/seller/dashboard/');
                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${isActive
                                    ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-secondary'
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-secondary'} />
                                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors group"
                    >
                        <LogOut size={20} className="group-hover:text-red-600" />
                        {isSidebarOpen && <span className="font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hidden md:block"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Store Online</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-200 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900">{auth.currentUser?.displayName || 'Merchant'}</p>
                                <p className="text-xs text-gray-500 capitalize">{auth.currentUser?.email || 'Store Owner'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                                <Store size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
