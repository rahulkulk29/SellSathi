import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from '../common/AuthModal';
import { listenToCart } from '../../utils/cartUtils';

export default function Navbar() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    // Check localStorage on mount and listen for changes
    useEffect(() => {
        const checkUser = () => {
            const userData = localStorage.getItem('user');
            if (userData) {
                try {
                    setUser(JSON.parse(userData));
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        checkUser();

        // Listen for userDataChanged event
        const handleUserChange = () => {
            checkUser();
        };

        window.addEventListener('userDataChanged', handleUserChange);

        return () => {
            window.removeEventListener('userDataChanged', handleUserChange);
        };
    }, []);

    // Listen to real-time cart updates
    useEffect(() => {
        const unsubscribe = listenToCart((items) => {
            const totalItems = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
            setCartCount(totalItems);
        });
        return () => unsubscribe();
    }, [user]);

    const handleSignOut = () => {
        localStorage.removeItem('user');
        setUser(null);
        setIsProfileOpen(false);
        window.dispatchEvent(new CustomEvent('userDataChanged'));
        navigate('/');
    };

    const handleLoginSuccess = () => {
        setIsLoginModalOpen(false);
        setIsProfileOpen(false);
        // User data will be updated via the userDataChanged event listener
    };

    return (
        <>
            <nav className="sticky top-6 z-[1000] mx-6">
                <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-black/5 rounded-[2rem] px-8 py-4 flex justify-between items-center transition-all duration-500">
                    <Link to="/" className="text-2xl font-black tracking-tighter group flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
                            <span className="text-xl">S</span>
                        </div>
                        <span className="bg-gradient-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent group-hover:text-primary transition-colors">
                            SELLSATHI
                        </span>
                    </Link>

                    {location.pathname === '/' && (
                        <div className="hidden lg:flex flex-1 max-w-md mx-8">
                            <div className="relative w-full group">
                                <Search
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                                />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    onChange={(e) => {
                                        const params = new URLSearchParams(window.location.search);
                                        if (e.target.value) {
                                            params.set('search', e.target.value);
                                        } else {
                                            params.delete('search');
                                        }
                                        navigate(`/?${params.toString()}`);
                                    }}
                                    className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:ring-4 ring-primary/10 transition-all outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 items-center">
                        <AnimatePresence>
                            {user && user.role === 'CONSUMER' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="hidden md:flex gap-3"
                                >
                                    <Link
                                        to="/dashboard"
                                        className="px-6 py-2.5 bg-slate-50 text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/seller/register"
                                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-primary/20 transition-all"
                                    >
                                        Become Seller
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Link
                            to="/checkout"
                            className="w-11 h-11 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all relative group"
                        >
                            <ShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div
                                className="relative"
                                onMouseEnter={() => setIsProfileOpen(true)}
                                onMouseLeave={() => setIsProfileOpen(false)}
                            >
                                <button
                                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isProfileOpen ? 'bg-primary text-white' : 'bg-slate-50 text-slate-600'}`}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-sm">
                                        {user.fullName?.charAt(0) || user.phone?.slice(-1) || 'U'}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full right-0 mt-3 w-72 bg-white rounded-[2rem] shadow-2xl shadow-black/10 border border-slate-100 overflow-hidden z-[1001]"
                                        >
                                            {/* Profile Header */}
                                            <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                                                        <User size={24} />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <h4 className="font-black text-slate-900 truncate">{user.fullName || 'Member'}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="p-4 space-y-1">
                                                <button
                                                    onClick={() => navigate('/dashboard')}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 text-slate-600 hover:text-primary transition-all font-bold text-sm"
                                                >
                                                    <User size={18} />
                                                    My Profile
                                                </button>
                                                <button
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 text-slate-600 hover:text-primary transition-all font-bold text-sm"
                                                >
                                                    <Search size={18} />
                                                    Recent Activity
                                                </button>
                                                <div className="h-px bg-slate-100 mx-4 my-2" />
                                                <button
                                                    onClick={handleSignOut}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 text-red-500 transition-all font-black text-sm uppercase tracking-widest"
                                                >
                                                    <LogOut size={18} />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsLoginModalOpen(true)}
                                className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-primary/20 transition-all"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <AuthModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSuccess={handleLoginSuccess}
            />
        </>
    );
}
