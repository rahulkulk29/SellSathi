import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, Users, Box, ShoppingCart,
    Truck, Check, X, AlertOctagon, Loader,
    Search, RefreshCw, ChevronRight, Filter,
    TrendingUp, Ban, CheckCircle2, LayoutDashboard,
    Download, Eye, ShieldAlert, ShieldBan, Info
} from 'lucide-react';
import { auth } from '../../config/firebase';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('sellers');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Data states
    const [stats, setStats] = useState({ totalSellers: 0, totalProducts: 0, todayOrders: 0, pendingApprovals: 0 });
    const [sellers, setSellers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    // Modal states
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedSeller, setSelectedSeller] = useState(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError('');
            const [statsRes, sellersRes, productsRes, ordersRes] = await Promise.all([
                fetch('http://localhost:5000/admin/stats'),
                fetch('http://localhost:5000/admin/sellers'),
                fetch('http://localhost:5000/admin/products'),
                fetch('http://localhost:5000/admin/orders')
            ]);

            const [statsData, sellersData, productsData, ordersData] = await Promise.all([
                statsRes.json(),
                sellersRes.json(),
                productsRes.json(),
                ordersRes.json()
            ]);

            if (statsData.success) setStats(statsData.stats);
            if (sellersData.success) setSellers(sellersData.sellers);
            if (productsData.success) setProducts(productsData.products);
            if (ordersData.success) setOrders(ordersData.orders);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load dashboard data. Please check your backend connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveSeller = async (uid) => {
        try {
            const response = await fetch(`http://localhost:5000/admin/seller/${uid}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.success) {
                fetchAllData();
            }
        } catch (err) {
            console.error('Error approving seller:', err);
        }
    };

    const handleRejectSeller = async (uid) => {
        try {
            const response = await fetch(`http://localhost:5000/admin/seller/${uid}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.success) {
                fetchAllData();
            }
        } catch (err) {
            console.error('Error rejecting seller:', err);
        }
    };

    const handleSuspendSeller = async (uid) => {
        try {
            const response = await fetch(`http://localhost:5000/admin/seller/${uid}/suspend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.success) {
                fetchAllData();
            }
        } catch (err) {
            console.error('Error suspending seller:', err);
        }
    };

    const handleActivateSeller = async (uid) => {
        try {
            const response = await fetch(`http://localhost:5000/admin/seller/${uid}/activate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.success) {
                fetchAllData();
            }
        } catch (err) {
            console.error('Error activating seller:', err);
        }
    };

    const fetchOrderDetails = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/admin/order-details/${id}`);
            const data = await res.json();
            if (data.success) {
                setSelectedOrder(data.order);
            }
        } catch (err) {
            console.error("Error fetching order details:", err);
        }
    };

    // Filter Logic
    const filteredSellers = sellers.filter(s =>
        s.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredOrders = orders.filter(o =>
        o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const navItems = [
        { id: 'sellers', label: 'Sellers', icon: Users, count: sellers.length },
        { id: 'products', label: 'Products', icon: Box, count: products.length },
        { id: 'orders', label: 'Orders', icon: ShoppingCart, count: orders.length }
    ];

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-md border border-red-100">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertOctagon size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Connection Error</h2>
                    <p className="text-gray-500 mb-8">{error}</p>
                    <button onClick={fetchAllData} className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all">
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
            {/* Sidebar */}
            <aside className="w-80 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen p-8 z-50">
                <div className="flex items-center gap-3 mb-12 px-2">
                    <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-12">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 leading-none">Admin</h2>
                        <p className="text-[10px] font-black tracking-widest text-primary uppercase mt-1">Sellsathi Hub</p>
                    </div>
                </div>

                <nav className="space-y-2 flex-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-4">Menu</p>
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setSearchTerm(''); }}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${activeTab === item.id
                                ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-x-1'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-primary'} />
                                <span className="font-bold">{item.label}</span>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${activeTab === item.id ? 'bg-white/20' : 'bg-gray-100'
                                }`}>
                                {item.count}
                            </span>
                        </button>
                    ))}
                </nav>

                <div className="pt-8 border-t border-gray-50">
                    <div className="bg-gray-50 p-6 rounded-[2rem] relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-tight mb-1">System Health</p>
                            <div className="flex items-center gap-2 text-green-600 font-bold">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                Operational
                            </div>
                        </div>
                        <CheckCircle2 className="absolute -right-4 -bottom-4 text-white opacity-50 group-hover:scale-110 transition-transform" size={80} />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-12 overflow-x-hidden">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                    <div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">
                            Dashboard <span className="text-primary font-light">Overview</span>
                        </h1>
                        <p className="text-gray-500 font-medium">Monitoring marketplace activity & administrative controls</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Global search..."
                                className="pl-14 pr-8 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-4 ring-primary/5 outline-none font-bold w-full md:w-80"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={fetchAllData}
                            className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all text-primary"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {[
                        { label: 'Total Sellers', value: stats.totalSellers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-100', trend: '+5' },
                        { label: 'Live Products', value: stats.totalProducts, icon: Box, color: 'text-purple-600', bg: 'bg-purple-500/10', border: 'border-purple-100', trend: '+12' },
                        { label: 'Daily Orders', value: stats.todayOrders, icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-100', trend: '+8' },
                        { label: 'Pending Approvals', value: stats.pendingApprovals, icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-100', trend: stats.pendingApprovals > 0 ? 'Action Reqd' : 'Clear' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`relative group bg-white p-8 rounded-[3rem] border ${stat.border} shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden`}
                        >
                            {/* Decorative background shape */}
                            <div className={`absolute -right-8 -top-8 w-32 h-32 ${stat.bg} rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700`} />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-inner`}>
                                        <stat.icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${stat.bg} ${stat.color} text-[10px] font-black uppercase tracking-tight`}>
                                        <TrendingUp size={12} />
                                        {stat.trend}
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-5xl font-black text-gray-900 tracking-tighter">
                                        {loading ? <Loader className="animate-spin" size={24} /> : stat.value}
                                    </h3>
                                    <span className="text-xs font-bold text-gray-400">Live</span>
                                </div>

                                {/* Micro Sparkline Visual */}
                                <div className="mt-6 flex gap-1 h-8 items-end">
                                    {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 1.0].map((h, idx) => (
                                        <div key={idx} className={`flex-1 ${stat.bg.replace('/10', '/30')} rounded-full`} style={{ height: `${h * 100}%` }} />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Data Section */}
                <section className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white rounded-2xl shadow-sm text-primary">
                                <LayoutDashboard size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 capitalize">{activeTab} <span className="text-primary font-light">Hub</span></h3>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl border border-gray-100 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                                <Filter size={16} /> Filter
                            </button>
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:shadow-lg shadow-primary/20 transition-all">
                                <Download size={16} /> Export
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center p-20 space-y-4"
                                >
                                    <Loader className="animate-spin text-primary" size={40} />
                                    <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Authenticating secure data...</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4"
                                >
                                    {activeTab === 'sellers' && (
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">
                                                    <th className="p-6">Store Details</th>
                                                    <th>Category</th>
                                                    <th>Status</th>
                                                    <th>Registration</th>
                                                    <th className="text-right p-6">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredSellers.map(s => (
                                                    <tr key={s.uid} className="hover:bg-gray-50/50 transition-colors group">
                                                        <td className="p-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center font-black text-primary shadow-sm">
                                                                    {s.shopName?.[0] || 'S'}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900">{s.shopName}</p>
                                                                    <p className="text-xs text-gray-500">{s.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black uppercase text-gray-600">
                                                                {s.category}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${s.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                                                                s.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                                                                    'bg-red-50 text-red-600'
                                                                }`}>
                                                                {s.status}
                                                            </span>
                                                        </td>
                                                        <td className="text-sm font-bold text-gray-500">{s.joined}</td>
                                                        <td className="p-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                {s.status === 'PENDING' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleApproveSeller(s.uid)}
                                                                            className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                                            title="Approve"
                                                                        >
                                                                            <Check size={18} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRejectSeller(s.uid)}
                                                                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                                            title="Reject"
                                                                        >
                                                                            <X size={18} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {s.status === 'APPROVED' && (
                                                                    <button
                                                                        onClick={() => handleSuspendSeller(s.uid)}
                                                                        className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                                                                        title="Suspend Seller"
                                                                    >
                                                                        <ShieldAlert size={18} />
                                                                    </button>
                                                                )}
                                                                {s.status === 'SUSPENDED' && (
                                                                    <button
                                                                        onClick={() => handleActivateSeller(s.uid)}
                                                                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                                        title="Reactivate Seller"
                                                                    >
                                                                        <CheckCircle2 size={18} />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => setSelectedSeller(s)}
                                                                    className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                                                                    title="View Details"
                                                                >
                                                                    <Eye size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}

                                    {activeTab === 'products' && (
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">
                                                    <th className="p-6">Product Details</th>
                                                    <th>Seller</th>
                                                    <th>Value</th>
                                                    <th className="text-right p-6">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredProducts.map(p => (
                                                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
                                                                    <img src={p.imageUrl} className="w-full h-full object-cover" alt="" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900">{p.title}</p>
                                                                    <p className="text-xs text-primary font-black uppercase tracking-widest">{p.category}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="text-sm font-bold text-gray-600">{p.seller}</td>
                                                        <td className="text-lg font-black text-gray-900">₹{p.price}</td>
                                                        <td className="p-6 text-right">
                                                            <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-green-100">
                                                                {p.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}

                                    {activeTab === 'orders' && (
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">
                                                    <th className="p-6">Transaction ID</th>
                                                    <th>Customer</th>
                                                    <th>Amount</th>
                                                    <th className="text-right p-6">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredOrders.map(o => (
                                                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                                                    <ShoppingCart size={18} />
                                                                </div>
                                                                <p className="font-black text-gray-900">#{o.orderId}</p>
                                                            </div>
                                                        </td>
                                                        <td className="font-bold text-gray-600">{o.customer}</td>
                                                        <td className="text-lg font-black text-gray-900">₹{o.total.toLocaleString()}</td>
                                                        <td className="p-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-primary/20">
                                                                    {o.status}
                                                                </span>
                                                                <button
                                                                    onClick={() => fetchOrderDetails(o.id)}
                                                                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                                                                >
                                                                    <Info size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}

                                    {((activeTab === 'sellers' && filteredSellers.length === 0) ||
                                        (activeTab === 'products' && filteredProducts.length === 0) ||
                                        (activeTab === 'orders' && filteredOrders.length === 0)) && (
                                            <div className="p-20 text-center space-y-4">
                                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                                    <Ban size={40} />
                                                </div>
                                                <h4 className="text-xl font-black text-gray-900">No matching records</h4>
                                                <p className="text-gray-400 max-w-xs mx-auto">Try adjusting your search term or check back later for new updates.</p>
                                            </div>
                                        )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>
            </main>

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
                                <div>
                                    <h2 className="text-2xl font-black">Order Details</h2>
                                    <p className="text-white/80 font-bold text-xs uppercase tracking-widest mt-1">ID: #{selectedOrder.orderId}</p>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 flex-1 overflow-y-auto space-y-8">
                                {/* Customer & Shipping */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer</p>
                                        <p className="font-bold text-gray-900">{selectedOrder.customerName}</p>
                                        <p className="text-sm text-gray-500">{selectedOrder.email}</p>
                                        <p className="text-sm text-gray-500">{selectedOrder.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Shipping Address</p>
                                        <div className="text-sm text-gray-900 font-medium">
                                            {selectedOrder.shippingAddress?.addressLine}<br />
                                            {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}<br />
                                            {selectedOrder.shippingAddress?.pincode}
                                        </div>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Line Items</p>
                                    <div className="space-y-3">
                                        {selectedOrder.items?.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100">
                                                        <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                                        <p className="text-xs text-gray-400 font-medium">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <p className="font-black text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="pt-8 border-t border-gray-100 space-y-2">
                                    <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                        <span>Subtotal</span>
                                        <span>₹{selectedOrder.total?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                                        <span>Tax (0%)</span>
                                        <span>₹0</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xl font-black text-gray-900 pt-2">
                                        <span>Order Total</span>
                                        <span className="text-primary">₹{selectedOrder.total?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Seller Details Modal */}
            <AnimatePresence>
                {selectedSeller && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 text-center bg-gray-50 border-b border-gray-100">
                                <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-3xl font-black shadow-inner">
                                    {selectedSeller.shopName?.[0] || 'S'}
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-1">{selectedSeller.shopName}</h2>
                                <p className="text-sm text-primary font-black uppercase tracking-widest">{selectedSeller.category}</p>
                            </div>

                            <div className="p-10 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                        <div className="p-2 bg-white rounded-xl shadow-sm"><Users size={20} className="text-primary" /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Identity</p>
                                            <p className="font-bold text-sm">{selectedSeller.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                        <div className="p-2 bg-white rounded-xl shadow-sm"><Box size={20} className="text-primary" /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Business Address</p>
                                            <p className="font-bold text-sm leading-tight">{selectedSeller.address}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedSeller(null)}
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all"
                                >
                                    Close Profile
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
