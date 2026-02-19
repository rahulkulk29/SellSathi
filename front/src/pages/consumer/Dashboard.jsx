
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import OrderOverviewCard from '../../components/dashboard/OrderOverviewCard';
import RecentPurchases from '../../components/dashboard/RecentPurchases';
import OrderTimeline from '../../components/dashboard/OrderTimeline';
import {
    Loader,
    AlertOctagon,
    Sparkles,
    MapPin,
    TrendingUp,
    ShoppingBag,
    Clock,
    ChevronRight,
    Search,
    Filter,
    Heart,
    History,
    Home,
    Settings,
    User,
    LogOut,
    Plus,
    CheckCircle2,
    X,
    ArrowLeft,
    Download
} from 'lucide-react';
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ConsumerDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({});
    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [savedAddress, setSavedAddress] = useState(null);
    const [activeTab, setActiveTab] = useState('orders');
    const [wishlist, setWishlist] = useState([]);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingProfile, setEditingProfile] = useState({ displayName: '', email: '' });
    const [editingAddress, setEditingAddress] = useState({ firstName: '', lastName: '', addressLine: '', city: '', pincode: '' });
    const location = useLocation();
    const navigate = useNavigate();

    // Sync state with URL sub-paths
    useEffect(() => {
        const path = location.pathname.split('/').pop();
        if (['orders', 'wishlist', 'settings', 'profile', 'addresses'].includes(path)) {
            setActiveTab(path);
        } else if (location.pathname === '/dashboard') {
            setActiveTab('orders');
        }
    }, [location]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setEditingProfile({ displayName: currentUser.displayName || '', email: currentUser.email || '' });
                fetchDashboardData(currentUser.uid);
                loadRecentlyViewed();
                fetchSavedAddress(currentUser.uid);
                fetchWishlist(currentUser.uid);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const loadRecentlyViewed = () => {
        const items = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        setRecentlyViewed(items);
    };

    const fetchSavedAddress = async (uid) => {
        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().savedAddress) {
                setSavedAddress(docSnap.data().savedAddress);
            }
        } catch (error) {
            console.error("Error fetching address:", error);
        }
    };

    const fetchWishlist = async (uid) => {
        try {
            const res = await fetch(`http://localhost:5000/api/user/${uid}/wishlist`);
            const data = await res.json();
            if (data.success) setWishlist(data.wishlist);
        } catch (err) {
            console.error("Wishlist Error:", err);
        }
    };

    const handleRemoveFromWishlist = async (productId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/user/${user.uid}/wishlist/${productId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setWishlist(wishlist.filter(item => item.id !== productId));
            }
        } catch (err) {
            console.error("Remove from Wishlist Error:", err);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/user/${user.uid}/profile/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileData: editingProfile })
            });
            const data = await res.json();
            if (data.success) {
                setShowProfileModal(false);
                // Ideally refresh user context or state
                setUser({ ...user, ...editingProfile });
            }
        } catch (err) {
            console.error("Profile Update Error:", err);
        }
    };

    const handleUpdateAddress = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:5000/api/user/${user.uid}/address/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: editingAddress })
            });
            const data = await res.json();
            if (data.success) {
                setSavedAddress(editingAddress);
                setShowAddressModal(false);
            }
        } catch (err) {
            console.error("Address Update Error:", err);
        }
    };

    const fetchDashboardData = async (uid) => {
        try {
            setLoading(true);
            const [statsRes, ordersRes] = await Promise.all([
                fetch(`http://localhost:5000/api/user/${uid}/stats`),
                fetch(`http://localhost:5000/api/user/${uid}/orders`)
            ]);

            const statsData = await statsRes.json();
            const ordersData = await ordersRes.json();

            if (statsData.success) setStats(statsData.stats);
            if (ordersData.success) {
                setOrders(ordersData.orders);
                if (ordersData.orders.length > 0) {
                    setSelectedOrder(ordersData.orders[0]);
                }
            }

        } catch (err) {
            console.error("Dashboard Error:", err);
            setError("Failed to load dashboard data. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-gray-50/30">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Sparkles size={24} className="text-primary animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white m-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="bg-gray-50 p-6 rounded-full mb-6">
                    <Clock size={48} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Session Expired</h3>
                <p className="text-gray-500 mb-8 max-w-sm text-center">Please log in to your account to access the consumer dashboard and your order history.</p>
                <button className="btn btn-primary px-8 py-3" onClick={() => window.location.href = '/'}>Go to Login</button>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-12">
                <div className="bg-red-50 border border-red-100 rounded-2xl p-10 flex flex-col items-center text-center">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-6">
                        <AlertOctagon size={48} className="text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
                    <p className="text-gray-500 mb-8 max-w-md">{error}</p>
                    <button className="btn btn-primary px-8 py-3 bg-red-600 hover:bg-red-700 border-none" onClick={() => fetchDashboardData(user.uid)}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!user && loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50/30">
                <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user && !loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50/30 gap-6">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 shadow-inner">
                    <User size={40} />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Please Sign In</h2>
                <p className="text-gray-500 font-medium">You need to be logged in to view your dashboard.</p>
                <Link to="/" className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all">
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 space-y-10 animate-fade-in max-w-[1600px] mx-auto">
            {/* Top Welcome Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-primary font-semibold mb-1">
                        <Sparkles size={18} />
                        <span>Welcome back, {user.displayName || 'Friend'}!</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Dashboard <span className="text-gray-400 font-light">Overview</span>
                    </h1>
                </div>

                <Link
                    to="/"
                    className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-sm font-black text-gray-600 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all shadow-sm group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Return to Marketplace
                </Link>
            </div>

            {/* Stats section */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <OrderOverviewCard stats={stats} loading={loading} />
            </section>

            {/* Dashboard Navigation Tabs */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
                    { id: 'wishlist', label: 'Wishlist', icon: Heart },
                    { id: 'settings', label: 'Settings', icon: Settings }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => navigate('/dashboard/' + tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                            : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content Areas based on Tabs */}
            <AnimatePresence mode="wait">
                {activeTab === 'orders' && (
                    <motion.div
                        key="orders"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 xl:grid-cols-12 gap-8"
                    >
                        {/* Left: Recent Activity & Orders */}
                        <div className="xl:col-span-8 space-y-8">
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <ShoppingBag size={22} className="text-primary" />
                                        Your Orders
                                    </h2>
                                </div>
                                <div className="p-0">
                                    <RecentPurchases
                                        orders={orders}
                                        loading={loading}
                                        onOrderClick={handleOrderClick}
                                        activeOrderId={selectedOrder?.id}
                                    />
                                </div>
                            </div>

                            {/* Recently Viewed Sub-module */}
                            {recentlyViewed.length > 0 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <History size={22} className="text-primary" />
                                        Recently Viewed
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {recentlyViewed.map(p => (
                                            <Link
                                                to={`/product/${p.id}`}
                                                key={p.id}
                                                className="bg-white p-3 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                                            >
                                                <div className="h-32 mb-3 rounded-2xl overflow-hidden">
                                                    <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                                                </div>
                                                <h4 className="text-xs font-bold text-gray-900 line-clamp-1 mb-1">{p.name}</h4>
                                                <p className="text-xs font-black text-primary">₹{p.price}</p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Order Status & Details */}
                        <div className="xl:col-span-4 space-y-8">
                            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
                                <div className="p-6 border-b border-gray-50">
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-primary">
                                        <MapPin size={22} />
                                        Order Status
                                    </h3>
                                </div>

                                <div className="p-8">
                                    {selectedOrder ? (
                                        <div className="space-y-8">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                                                    <p className="font-mono text-lg font-bold text-gray-900">#{selectedOrder.orderId || selectedOrder.id.substring(0, 8)}</p>
                                                </div>
                                                <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-green-100">
                                                    {selectedOrder.status || 'Processing'}
                                                </div>
                                            </div>

                                            <OrderTimeline currentStatus={selectedOrder.status || 'Placed'} />

                                            <div className="pt-8 border-t border-gray-50 flex gap-4">
                                                <button
                                                    onClick={() => navigate(`/track?orderId=${selectedOrder.orderId || selectedOrder.id}`)}
                                                    className="flex-1 btn btn-primary py-4 rounded-2xl shadow-lg shadow-primary/20"
                                                >
                                                    Track Detailed
                                                </button>
                                                <button
                                                    className="p-4 bg-gray-50 hover:bg-gray-100 text-primary rounded-2xl transition-all hover:shadow-md active:scale-95"
                                                    title="Download Invoice"
                                                    onClick={() => window.open(`http://localhost:5000/api/invoice/${selectedOrder.orderId || selectedOrder.id}`, '_blank')}
                                                >
                                                    <Download size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 px-6">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                                                <MapPin size={32} className="text-gray-300" />
                                            </div>
                                            <p className="text-gray-400 font-bold">Select an order from the list to see status details.</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'wishlist' && (
                    <motion.div
                        key="wishlist"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-12 text-center"
                    >
                        {wishlist.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-left">
                                {wishlist.map(product => (
                                    <div key={product.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
                                        <div className="h-48 overflow-hidden relative">
                                            <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                                            <button
                                                onClick={() => handleRemoveFromWishlist(product.id)}
                                                className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full text-pink-500 shadow-sm hover:bg-red-500 hover:text-white transition-all"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                        <div className="p-6">
                                            <h4 className="font-bold text-gray-900 mb-1">{product.name}</h4>
                                            <p className="text-primary font-black mb-4">₹{product.price}</p>
                                            <Link to={`/product/${product.id}`} className="block w-full text-center py-3 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl font-bold transition-all text-sm">
                                                View Product
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="w-24 h-24 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Heart size={40} className="fill-pink-500" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-2">My <span className="text-pink-500 font-light">Wishlist</span></h2>
                                <p className="text-gray-500 mb-10 max-w-sm mx-auto">Items you've saved for later will appear here. Start exploring our premium collection today!</p>
                                <Link to="/products" className="btn btn-primary px-10 py-4 rounded-2xl font-black">
                                    Browse Products
                                </Link>
                            </>
                        )}
                    </motion.div>
                )}

                {['settings', 'profile', 'addresses'].includes(activeTab) && (
                    <motion.div
                        key="settings"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        {/* Profile Info */}
                        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 space-y-8">
                            <div className="flex items-center gap-6 pb-8 border-b border-gray-50">
                                <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-black shadow-xl shadow-primary/20">
                                    {user.displayName?.[0] || 'U'}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">{user.displayName || 'Sellsathi Member'}</h3>
                                    <p className="text-gray-500 font-medium">{user.email}</p>
                                    <div className="mt-2 inline-flex px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold ring-1 ring-green-100">
                                        Verified Consumer
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Account Actions</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={() => {
                                            setEditingProfile({ displayName: user.displayName || '', email: user.email || '' });
                                            setShowProfileModal(true);
                                        }}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3 font-bold text-gray-700">
                                            <User size={20} className="text-primary" />
                                            Update Profile
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
                                        <div className="flex items-center gap-3 font-bold text-gray-700">
                                            <Settings size={20} className="text-primary" />
                                            Notification Preferences
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => auth.signOut()}
                                        className="flex items-center justify-between p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3 font-bold text-red-600">
                                            <LogOut size={20} />
                                            Sign Out
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Saved Address Manager */}
                        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-black text-gray-900">Saved <span className="gradient-text">Addresses</span></h3>
                                <button
                                    onClick={() => {
                                        setEditingAddress(savedAddress || { firstName: '', lastName: '', addressLine: '', city: '', pincode: '' });
                                        setShowAddressModal(true);
                                    }}
                                    className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            {savedAddress ? (
                                <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 relative group">
                                    <div className="absolute top-6 right-6 flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingAddress(savedAddress);
                                                setShowAddressModal(true);
                                            }}
                                            className="p-2 bg-white rounded-lg text-primary shadow-sm hover:scale-110 transition-transform text-xs font-bold"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                                            <Home size={22} />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900">Primary Home</p>
                                            <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                                                <CheckCircle2 size={12} /> Default Address
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 font-medium space-y-1">
                                        <p className="font-bold text-gray-900">{savedAddress.firstName} {savedAddress.lastName}</p>
                                        <p>{savedAddress.addressLine}</p>
                                        <p>{savedAddress.city}, {savedAddress.pincode}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-10 border-2 border-dashed border-gray-100 rounded-[2rem] text-center space-y-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                        <MapPin size={24} />
                                    </div>
                                    <p className="text-gray-400 font-bold">No saved addresses yet.</p>
                                    <button className="text-primary font-black hover:underline">Add Address Now</button>
                                </div>
                            )}

                            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-50 flex gap-4">
                                <div className="bg-white p-3 rounded-2xl text-blue-600 shadow-sm">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900">Smart Checkout Enabled</p>
                                    <p className="text-xs text-gray-500 font-medium">Your primary address will be automatically selected during your next purchase.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profile Update Modal */}
            <AnimatePresence>
                {showProfileModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/30">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
                            <form onSubmit={handleUpdateProfile} className="p-10 space-y-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-2xl font-black text-gray-900">Update <span className="text-primary font-light">Profile</span></h3>
                                    <button type="button" onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-900"><X /></button>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                                        <input type="text" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-4 ring-primary/10 transition-all outline-none" value={editingProfile.displayName} onChange={e => setEditingProfile({ ...editingProfile, displayName: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Email</label>
                                        <input type="email" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-4 ring-primary/10 transition-all outline-none" value={editingProfile.email} onChange={e => setEditingProfile({ ...editingProfile, email: e.target.value })} />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Address Modal */}
            <AnimatePresence>
                {showAddressModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/30">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
                            <form onSubmit={handleUpdateAddress} className="p-10 space-y-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-2xl font-black text-gray-900">Manage <span className="text-primary font-light">Address</span></h3>
                                    <button type="button" onClick={() => setShowAddressModal(false)} className="text-gray-400 hover:text-gray-900"><X /></button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">First Name</label>
                                        <input type="text" required className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-4 ring-primary/10 transition-all outline-none" value={editingAddress.firstName} onChange={e => setEditingAddress({ ...editingAddress, firstName: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Last Name</label>
                                        <input type="text" required className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-4 ring-primary/10 transition-all outline-none" value={editingAddress.lastName} onChange={e => setEditingAddress({ ...editingAddress, lastName: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Address Line</label>
                                    <input type="text" required className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-4 ring-primary/10 transition-all outline-none" value={editingAddress.addressLine} onChange={e => setEditingAddress({ ...editingAddress, addressLine: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">City</label>
                                        <input type="text" required className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-4 ring-primary/10 transition-all outline-none" value={editingAddress.city} onChange={e => setEditingAddress({ ...editingAddress, city: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Pincode</label>
                                        <input type="text" required className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-4 ring-primary/10 transition-all outline-none" value={editingAddress.pincode} onChange={e => setEditingAddress({ ...editingAddress, pincode: e.target.value })} />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                        Update Address
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
