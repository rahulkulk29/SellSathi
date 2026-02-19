import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    User,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    Package,
    Heart,
    MapPin
} from 'lucide-react';
import { useState } from 'react';
import { auth } from '../../config/firebase';
import NotificationPanel from '../common/NotificationPanel';

export default function ConsumerLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: ShoppingBag, label: 'My Orders', path: '/dashboard/orders' },
        { icon: Heart, label: 'Wishlist', path: '/dashboard/wishlist' },
        { icon: MapPin, label: 'Addresses', path: '/dashboard/addresses' },
        { icon: User, label: 'Profile', path: '/dashboard/profile' },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
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
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
                        S
                    </div>
                    {isSidebarOpen && <span className="font-bold text-xl tracking-tight">Sellsathi</span>}
                </div>

                <nav className="flex-1 p-4 space-y-1 mt-4">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${isActive
                                        ? 'bg-primary text-white'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-primary'} />
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
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hidden md:block"
                        >
                            <Menu size={20} />
                        </button>
                        <Link
                            to="/"
                            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all group"
                        >
                            <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:to-indigo-700">
                                SELLSATHI
                            </span>
                            <span className="text-xs text-gray-400 font-medium">Return to Home</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsNotificationOpen(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 relative"
                        >
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-200 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900">{auth.currentUser?.displayName || 'Consumer'}</p>
                                <p className="text-xs text-gray-500 capitalize">{auth.currentUser?.email || 'Premium Member'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <User size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>

            {/* Notification Panel */}
            <NotificationPanel 
                isOpen={isNotificationOpen} 
                onClose={() => setIsNotificationOpen(false)} 
            />
        </div>
    );
}
