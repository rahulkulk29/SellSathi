import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { LayoutDashboard, Package, ShoppingBag, DollarSign, Plus, Edit2, Trash2, Truck, Loader, X, Home, Upload, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
=======
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingBag, DollarSign, Plus,
    Edit2, Trash2, Truck, Loader, X, Sparkles, BarChart3,
    TrendingUp, Search, Filter, Download
} from 'lucide-react';
>>>>>>> lokesh
import { auth } from '../../config/firebase';
import { authFetch } from '../../utils/api';

// Helper to get current user UID (works for both Firebase and test login)
const getUserUid = () => {
    // Try Firebase first
    if (auth.currentUser) return auth.currentUser.uid;
    // Fall back to localStorage (test login stores uid there)
    try {
        const userData = JSON.parse(localStorage.getItem('user'));
        return userData?.uid || null;
    } catch { return null; }
};

export default function SellerDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
<<<<<<< HEAD
    const [sellerUid, setSellerUid] = useState(null);
=======
    const location = useLocation();
    const navigate = useNavigate();

    // Sync state with URL sub-paths
    useEffect(() => {
        const path = location.pathname.split('/').pop();
        if (['overview', 'products', 'orders', 'analytics', 'settings'].includes(path)) {
            setActiveTab(path);
        } else if (location.pathname === '/seller/dashboard' || location.pathname === '/seller/dashboard/') {
            setActiveTab('overview');
        }
    }, [location]);
>>>>>>> lokesh

    // Data States
    const [stats, setStats] = useState({ totalSales: 0, totalProducts: 0, newOrders: 0, pendingOrders: 0 });
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [profile, setProfile] = useState({ name: '...', shopName: '' });

    // Modal States
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(() => {
        const loadDashboard = async () => {
            const uid = getUserUid();
            setSellerUid(uid);

            if (!uid) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await authFetch(`/seller/${uid}/dashboard-data`);
                const data = await response.json();

                if (data.success) {
                    setProfile(data.profile);
                    setStats(data.stats);
                    setProducts(data.products);
                    setOrders(data.orders);
                }
            } catch (error) {
                console.error("Error fetching seller data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);



    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setEditData({ ...product, discountPrice: product.discountPrice || '' });
        setIsEditing(false);
        setShowViewModal(true);
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        const uid = sellerUid || getUserUid();
        if (!uid) return;

        setUpdateLoading(true);
        try {
            const response = await authFetch(`/seller/product/update/${selectedProduct.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    sellerId: uid,
                    productData: editData
                })
            });

            const data = await response.json();
            if (data.success) {
                alert("Product updated successfully!");
                setIsEditing(false);
                setSelectedProduct({ ...editData });
                // Refresh list
                setProducts(products.map(p => p.id === selectedProduct.id ? { ...editData, id: p.id } : p));
            } else {
                alert("Failed to update: " + data.message);
            }
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Error updating product");
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const response = await authFetch(`/seller/product/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) {
                setProducts(products.filter(p => p.id !== id));
            } else {
                alert("Failed to delete product");
            }
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const handleUpdateStatus = async (orderId, currentStatus) => {
        const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
        const newStatus = statuses[nextIndex];

        try {
            const response = await authFetch(`/seller/order/${orderId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            if (data.success) {
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const statCards = [
        { label: 'Total Sales', value: `₹${stats.totalSales?.toLocaleString('en-IN') || 0}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
        { label: 'Active Products', value: stats.totalProducts || 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { label: 'New Orders', value: stats.newOrders || 0, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
        { label: 'Pending', value: stats.pendingOrders || 0, icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    ];

    if (loading) {
        return (
<<<<<<< HEAD
            <div className="flex flex-col justify-center items-center h-screen gap-4" style={{ background: 'var(--background)' }}>
                <Loader className="animate-spin" size={40} color="var(--primary)" />
                <p style={{ fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>Initializing your dashboard...</p>
            </div>
        );
    }

    if (profile.status === 'PENDING') {
        return (
            <div className="flex flex-col justify-center items-center h-screen gap-6 p-8 text-center" style={{ background: 'var(--background)' }}>
                <div style={{ padding: '2rem', background: 'var(--warning)15', borderRadius: '50%', color: 'var(--warning)' }}>
                    <Truck size={64} />
                </div>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: '#1e293b' }}>Application Pending</h2>
                    <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', lineHeight: 1.6 }}>
                        Thanks for applying to be a seller! Your application is currently under review by our admin team.
                        <br />You will be notified once it is approved.
                    </p>
                </div>
                <button onClick={() => window.location.reload()} className="btn btn-secondary" style={{ marginTop: '1rem' }}>Check Status</button>
            </div>
        );
    }

    if (profile.status === 'REJECTED') {
        return (
            <div className="flex flex-col justify-center items-center h-screen gap-6 p-8 text-center" style={{ background: 'var(--background)' }}>
                <div style={{ padding: '2rem', background: 'var(--error)15', borderRadius: '50%', color: 'var(--error)' }}>
                    <X size={64} />
                </div>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: '#1e293b' }}>Application Rejected</h2>
                    <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', lineHeight: 1.6 }}>
                        We're sorry, but your seller application was not approved at this time.
                    </p>
                </div>
                <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Return to Home</Link>
=======
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-white/50 backdrop-blur-sm">
                <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading your dashboard...</p>
>>>>>>> lokesh
            </div>
        );
    }

    return (
<<<<<<< HEAD
        <div className="flex" style={{ minHeight: 'calc(100vh - 80px)', width: '100%', gap: '0', padding: '0' }}>
            {/* Seller Pro Sidebar - Distinct Dark Theme */}
            <aside className="flex flex-col justify-between" style={{
                width: '260px',
                height: 'calc(100vh - 80px)',
                padding: '2rem 1.5rem',
                position: 'sticky',
                top: '80px',
                background: '#1e293b', // Slate-800
                color: '#f8fafc',
                boxShadow: '4px 0 24px rgba(0,0,0,0.05)',
                zIndex: 10
            }}>
                <div>
                    <div style={{ paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '0.05em', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></div>
                            SELLER CENTER
                        </h3>
                    </div>

                    <nav className="flex flex-col gap-3">
                        <Link
                            to="/"
                            className="btn"
                            style={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                padding: '1rem',
                                fontSize: '0.95rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'rgba(255,255,255,0.8)',
                                border: 'none',
                                borderRadius: '12px'
                            }}
                        >
                            <Home size={18} />
                            Storefront
                        </Link>
                        {['overview', 'products', 'orders'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '1rem',
                                    fontSize: '0.95rem',
                                    borderRadius: '12px',
                                    textTransform: 'capitalize',
                                    transition: 'all 0.2s ease',
                                    background: activeTab === tab ? 'var(--primary)' : 'transparent',
                                    color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.7)',
                                    fontWeight: activeTab === tab ? 600 : 400,
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {tab === 'overview' && <LayoutDashboard size={18} />}
                                {tab === 'products' && <Package size={18} />}
                                {tab === 'orders' && <ShoppingBag size={18} />}
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
                            <Edit2 size={14} className="text-white" />
                        </div>
                        <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Tip</small>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                        Update your inventory daily to boost visibility.
                    </p>
                </div>
            </aside>

            {/* Main Content Area - Light & Spacious */}
            <div className="flex-1 flex flex-col" style={{ padding: '2.5rem 3rem', background: '#f8fafc', gap: '2rem', height: 'calc(100vh - 80px)', overflowY: 'auto' }}>
                <div className="flex justify-between items-center">
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>Dashboard</h2>
                        <p style={{ color: '#64748b' }}>Welcome back, <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{profile.name}</span></p>
=======
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header / Welcome */}
            <div className="relative overflow-hidden bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm group">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-secondary font-bold mb-2">
                            <Sparkles size={18} />
                            <span className="text-sm uppercase tracking-wider">Seller Overview</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                            Welcome back, <span className="text-secondary">{auth.currentUser?.displayName?.split(' ')[0] || 'Partner'}!</span>
                        </h1>
                        <p className="text-gray-500 font-medium">Your store is performing great today. Here's a quick look at your growth.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn btn-primary px-8 py-4 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/25 hover:-translate-y-1 transition-all"
                        >
                            <Plus size={20} />
                            <span>Add Product</span>
                        </button>
>>>>>>> lokesh
                    </div>
                    <button className="btn btn-primary shadow-lg hover:shadow-xl transition-all" onClick={() => navigate('/seller/add-product')} style={{ padding: '0.75rem 1.5rem', borderRadius: '50px' }}>
                        <Plus size={20} /> New Product
                    </button>
                </div>
                {/* Decorative background blur */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-secondary/10 transition-colors"></div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
<<<<<<< HEAD
                    <div className="animate-fade-in flex flex-col" style={{ gap: '2.5rem' }}>
                        {/* Panoramic Stats Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                            {statCards.map((s, i) => (
                                <div key={i} style={{
                                    background: 'white',
                                    padding: '1.5rem',
                                    borderRadius: '20px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                                    border: '1px solid #f1f5f9',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    height: '160px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: '48px', height: '48px',
                                        borderRadius: '12px',
                                        background: s.color + '15',
                                        color: s.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {s.icon}
                                    </div>

                                    <div>
                                        <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', lineHeight: 1, marginBottom: '0.25rem' }}>{s.value}</h3>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>{s.label}</p>
                                    </div>
=======
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {statCards.map((card, idx) => (
                                <div
                                    key={idx}
                                    className={`bg-white p-6 rounded-[2rem] border ${card.border} shadow-sm hover:shadow-md transition-all group relative overflow-hidden`}
                                >
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest">{card.label}</p>
                                            <h3 className="text-3xl font-black text-gray-900">{card.value}</h3>
                                        </div>
                                        <div className={`${card.bg} ${card.color} p-4 rounded-2xl group-hover:scale-110 transition-transform shadow-sm`}>
                                            <card.icon size={24} />
                                        </div>
                                    </div>
                                    <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${card.bg} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700`}></div>
>>>>>>> lokesh
                                </div>
                            ))}
                        </div>

<<<<<<< HEAD
                        {/* Store Performance Placeholder */}


                        {/* Performance Analytics */}
                        <div style={{
                            background: 'white',
                            borderRadius: '24px',
                            padding: '2rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                            border: '1px solid #f1f5f9'
                        }}>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Performance Analytics</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Annual Sales Growth</p>
                                </div>
                                <select
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        background: '#f8fafc',
                                        fontSize: '0.85rem',
                                        color: '#64748b'
                                    }}
                                >
                                    <option>This Year</option>
                                    <option>Last Year</option>
                                </select>
                            </div>

                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={
                                        // Calculate monthly sales data dynamically from orders
                                        (() => {
                                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                            const currentYear = new Date().getFullYear();

                                            // Initialize with 0
                                            const monthlyData = months.map(m => ({ name: m, sales: 0, orders: 0 }));

                                            orders.forEach(order => {
                                                const orderDate = new Date(order.date);
                                                if (orderDate.getFullYear() === currentYear) {
                                                    const monthIndex = orderDate.getMonth();
                                                    if (monthIndex >= 0 && monthIndex < 12) {
                                                        monthlyData[monthIndex].sales += Number(order.total);
                                                        monthlyData[monthIndex].orders += 1;
                                                    }
                                                }
                                            });
                                            return monthlyData;
                                        })()
                                    }>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            tickFormatter={(value) => `₹${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                            formatter={(value) => [`₹${value}`, 'Sales']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="sales"
                                            stroke="var(--primary)"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorSales)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
=======
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Performance Chart Placeholder */}
                            <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">Sales Analytics</h3>
                                        <p className="text-sm text-gray-500 font-medium pt-1">Performance in the last 30 days</p>
                                    </div>
                                    <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-gray-600 focus:ring-2 ring-secondary/20 transition-all outline-none">
                                        <option>Last 30 Days</option>
                                        <option>Last 6 Months</option>
                                        <option>This Year</option>
                                    </select>
                                </div>
                                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/30">
                                    <BarChart3 size={48} className="text-gray-200 mb-4" />
                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Analytics Coming Soon</p>
                                </div>
                            </div>

                            {/* Store Health */}
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                                <h3 className="text-xl font-black text-gray-900 mb-6">Store Health</h3>
                                <div className="space-y-6">
                                    {[
                                        { label: 'Order Completion', value: 98, color: 'bg-green-500' },
                                        { label: 'Customer Rating', value: 85, color: 'bg-blue-500' },
                                        { label: 'Inventory Level', value: 45, color: 'bg-amber-500' },
                                    ].map(item => (
                                        <div key={item.label} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-bold text-gray-600">{item.label}</span>
                                                <span className="font-black text-gray-900">{item.value}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.value}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className={`h-full ${item.color} rounded-full`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 p-4 bg-secondary/5 rounded-2xl border border-secondary/10">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-secondary border border-secondary/10 shrink-0 shadow-sm">
                                            <TrendingUp size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-secondary">Pro Tip!</p>
                                            <p className="text-xs text-gray-600 font-medium leading-relaxed">Increase your stock levels for trending items to qualify for the 'Prime' seller badge.</p>
                                        </div>
                                    </div>
                                </div>
>>>>>>> lokesh
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'products' && (
<<<<<<< HEAD
                    <div className="animate-fade-in flex flex-col gap-4" style={{ height: '100%' }}>
                        <div className="glass-card flex-1" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'white', border: 'none', boxShadow: 'var(--shadow-md)' }}>
                            {products.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                                    <Package size={64} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                                    <h3 style={{ color: '#1e293b' }}>No Products Yet</h3>
                                    <p style={{ color: '#64748b' }}>Start selling by adding your first product using the button above.</p>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto', flex: 1 }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: '#1e293b', color: 'white', textAlign: 'left' }}>
                                            <tr>
                                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Product Details</th>
                                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Category</th>
                                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Price</th>
                                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Stock</th>
                                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(p => (
                                                <tr key={p.id}
                                                    style={{ borderBottom: '1px solid #f1f5f9', background: 'white', transition: 'background 0.15s ease' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                                >
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                            {p.image ? (
                                                                <img src={p.image} style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }} />
                                                            ) : (
                                                                <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                    <Package size={20} style={{ color: '#94a3b8' }} />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p style={{ fontWeight: 600, color: '#1e293b', margin: 0, fontSize: '0.95rem' }}>{p.title}</p>
                                                                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.78rem', marginTop: '2px' }}>ID: {p.id?.substring(0, 8)}...</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                                            {p.category}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#1e293b', fontSize: '1rem', whiteSpace: 'nowrap' }}>
                                                        ₹{Number(p.price).toLocaleString('en-IN')}
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.stock > 0 ? '#22c55e' : '#ef4444', flexShrink: 0 }}></div>
                                                            <span style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>{p.stock || 0} units</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                style={{ padding: '0.45rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 500 }}
                                                                onClick={() => handleViewProduct(p)}
                                                                title="View / Edit Product"
                                                            >
                                                                <Eye size={14} /> View
                                                            </button>
                                                            <button
                                                                style={{ padding: '0.45rem 1rem', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fff5f5', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 500 }}
                                                                onClick={() => handleDeleteProduct(p.id)}
                                                                title="Delete Product"
                                                            >
                                                                <Trash2 size={14} /> Delete
                                                            </button>
=======
                    <motion.div
                        key="products"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden"
                    >
                        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">Manage Products</h3>
                                <p className="text-gray-500 font-medium pt-1">Control your inventory and listings ({products.length} active items)</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-600 focus:ring-2 ring-secondary/20 transition-all outline-none w-full md:w-64"
                                    />
                                </div>
                                <button className="p-3 bg-gray-50 rounded-2xl text-gray-500 hover:bg-gray-100 transition-colors">
                                    <Filter size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {products.length === 0 ? (
                                <div className="py-24 text-center">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                        <Package size={48} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-2">Inventory is empty</h3>
                                    <p className="text-gray-500 font-medium max-w-sm mx-auto mb-8">Ready to start selling? Add your first product and start earning.</p>
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="btn btn-primary px-8 rounded-2xl shadow-lg shadow-primary/20"
                                    >
                                        Add First Product
                                    </button>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-8 py-5">Product Details</th>
                                            <th className="px-6">Category</th>
                                            <th className="px-6">Price</th>
                                            <th className="px-6">Stock Level</th>
                                            <th className="px-8 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {products.map(p => (
                                            <tr key={p.id} className="group hover:bg-gray-50/30 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl border border-gray-100 overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                                                            {p.image ? (
                                                                <img src={p.image} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                                                                    <Package size={20} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 group-hover:text-secondary transition-colors line-clamp-1">{p.title}</p>
                                                            <p className="text-xs text-gray-400 font-medium mt-0.5">ID: {p.id.substring(0, 8)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6">
                                                    <span className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-xs font-bold text-gray-600 shadow-sm">
                                                        {p.category}
                                                    </span>
                                                </td>
                                                <td className="px-6">
                                                    <p className="font-black text-gray-900 text-lg">₹{p.price?.toLocaleString('en-IN')}</p>
                                                </td>
                                                <td className="px-6">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${p.stock > 10 ? 'bg-green-500' : p.stock > 0 ? 'bg-amber-500' : 'bg-red-500'} shadow-sm shadow-current/20`}></div>
                                                            <span className="text-sm font-bold text-gray-700">{p.stock || 0} Units</span>
                                                        </div>
                                                        <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${p.stock > 10 ? 'bg-green-500' : 'bg-amber-500'} rounded-full`}
                                                                style={{ width: `${Math.min(p.stock * 2, 100)}%` }}
                                                            />
>>>>>>> lokesh
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-secondary hover:border-secondary/20 hover:shadow-sm transition-all">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(p.id)}
                                                            className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-600 hover:border-red-100 hover:shadow-sm transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'orders' && (
                    <motion.div
                        key="orders"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden"
                    >
                        <div className="p-8 border-b border-gray-50">
                            <h3 className="text-2xl font-black text-gray-900">Customer Orders</h3>
                            <p className="text-gray-500 font-medium pt-1">Track and fulfill your incoming requests</p>
                        </div>
                        {orders.length === 0 ? (
                            <div className="py-24 text-center">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                    <ShoppingBag size={48} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">No orders found</h3>
                                <p className="text-gray-500 font-medium max-w-sm mx-auto">New orders will show up here as customers purchase your items.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                        <tr>
                                            <th className="px-8 py-5">Order Context</th>
                                            <th className="px-6">Customer</th>
                                            <th className="px-6">Revenue</th>
                                            <th className="px-6">Status</th>
                                            <th className="px-8 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {orders.map(o => (
                                            <tr key={o.id} className="group hover:bg-gray-50/30 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div>
                                                        <p className="font-black text-gray-900 tracking-tight">#{o.orderId?.substring(0, 10).toUpperCase()}</p>
                                                        <p className="text-xs text-gray-400 font-medium mt-0.5">Placed on {new Date().toLocaleDateString()}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-xs border border-secondary/20 shadow-sm">
                                                            {o.customer?.charAt(0) || 'C'}
                                                        </div>
<<<<<<< HEAD
                                                    </td>
                                                    <td style={{ fontWeight: 600 }}>₹{o.total}</td>
                                                    <td>
                                                        <span style={{
                                                            padding: '0.35rem 0.75rem',
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 500,
                                                            background: o.status === 'Delivered' ? 'rgba(var(--success-rgb), 0.1)' : 'rgba(var(--warning-rgb), 0.1)',
                                                            color: o.status === 'Delivered' ? 'var(--success)' : 'var(--warning)',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem'
                                                        }}>
                                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
                                                            {o.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.25rem' }}>
                                                        <button
                                                            onClick={() => handleUpdateStatus(o.id, o.status)}
                                                            className="btn btn-secondary btn-sm flex items-center gap-2"
                                                        >
                                                            Update Status
=======
                                                        <p className="font-bold text-gray-700 text-sm">{o.customer || 'Standard Customer'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 font-black text-gray-900">₹{o.total?.toLocaleString('en-IN')}</td>
                                                <td className="px-6">
                                                    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-wide shadow-sm ${o.status === 'Delivered'
                                                        ? 'bg-green-50 text-green-600 ring-1 ring-green-100'
                                                        : 'bg-amber-50 text-amber-600 ring-1 ring-amber-100 animate-pulse'
                                                        }`}>
                                                        <span className={`w-2 h-2 rounded-full ${o.status === 'Delivered' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                                        {o.status?.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-8 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => window.open(`http://localhost:5000/api/invoice/${o.orderId || o.id}`, '_blank')}
                                                            className="p-2 bg-gray-50 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-xl transition-all"
                                                            title="Download Invoice"
                                                        >
                                                            <Download size={16} />
>>>>>>> lokesh
                                                        </button>
                                                        <button className="px-5 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-secondary hover:bg-secondary hover:text-white hover:border-secondary transition-all shadow-sm">
                                                            UPDATE STATUS
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

<<<<<<< HEAD
            {/* View/Edit Product Modal */}
            <AnimatePresence>
                {showViewModal && selectedProduct && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(5, 5, 15, 0.75)', backdropFilter: 'blur(20px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            style={{
                                width: '100%',
                                maxWidth: '900px',
                                maxHeight: '95vh',
                                overflowY: 'auto',
                                borderRadius: '28px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'white',
                                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.25)',
                                color: 'var(--text)',
                                position: 'relative'
                            }}
                        >
                            {/* Header Section */}
                            <div style={{
                                padding: '2rem 2.5rem',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'linear-gradient(to right, #f8fafc, white)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        padding: '0.75rem',
                                        background: 'var(--primary)15',
                                        color: 'var(--primary)',
                                        borderRadius: '12px'
                                    }}>
                                        {isEditing ? <Edit2 size={24} /> : <Eye size={24} />}
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
                                            {isEditing ? 'Editing' : 'Product'} <span className="gradient-text">Details</span>
                                        </h2>
                                        <p className="text-muted" style={{ margin: 0 }}>ID: {selectedProduct.id}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {!isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="btn btn-primary"
                                            style={{ padding: '0.75rem 1.5rem', borderRadius: '12px' }}
                                        >
                                            <Edit2 size={18} /> Modify Listing
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowViewModal(false)}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: '12px',
                                            background: 'var(--surface)',
                                            color: 'var(--text-muted)'
                                        }}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateProduct} style={{ padding: '2.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem' }}>
                                    {/* Left Side: Media & Quick Actions */}
                                    <div className="flex flex-col gap-6">
                                        <div style={{
                                            position: 'relative',
                                            borderRadius: '24px',
                                            overflow: 'hidden',
                                            boxShadow: 'var(--shadow-lg)',
                                            border: '1px solid var(--border)'
                                        }}>
                                            <img
                                                src={isEditing ? editData.image : selectedProduct.image}
                                                alt={selectedProduct.title}
                                                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/600x600?text=Product+Media'; }}
                                            />
                                            {selectedProduct.stock <= 5 && !isEditing && (
                                                <div style={{
                                                    position: 'absolute', top: '1rem', left: '1rem',
                                                    background: 'var(--error)', color: 'white',
                                                    padding: '0.4rem 0.8rem', borderRadius: '8px',
                                                    fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase'
                                                }}>
                                                    Low Stock
                                                </div>
                                            )}
                                        </div>

                                        {isEditing && (
                                            <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: '16px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    <Upload size={14} /> Image URL:
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editData.image}
                                                    onChange={e => setEditData({ ...editData, image: e.target.value })}
                                                    style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '1px solid var(--border)' }}
                                                    placeholder="Enter new image URL..."
                                                />
                                            </div>
                                        )}

                                        {!isEditing && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
                                                    <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Status:</p>
                                                    <p style={{ fontWeight: 600, color: 'var(--success)' }}>Active</p>
                                                </div>
                                                <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
                                                    <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Views:</p>
                                                    <p style={{ fontWeight: 600 }}>248</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Side: Information Form */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                                        {/* Title Field */}
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Product Title
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editData.title}
                                                    onChange={e => setEditData({ ...editData, title: e.target.value })}
                                                    style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 600, borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                                    required
                                                />
                                            ) : (
                                                <h3 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#1e293b', lineHeight: 1.2 }}>
                                                    {selectedProduct.title}
                                                </h3>
                                            )}
                                        </div>

                                        {/* Price Row — fixed 2 columns */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            {/* Retail Price */}
                                            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                                                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Retail Price
                                                </label>
                                                {isEditing ? (
                                                    <div style={{ position: 'relative' }}>
                                                        <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--primary)' }}>₹</span>
                                                        <input
                                                            type="number"
                                                            value={editData.price}
                                                            onChange={e => setEditData({ ...editData, price: e.target.value })}
                                                            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 1.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 600 }}
                                                            required
                                                        />
                                                    </div>
                                                ) : (
                                                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                                                        ₹{Number(selectedProduct.price).toLocaleString('en-IN')}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Discount Price */}
                                            <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '1rem', border: '1px solid #bbf7d0' }}>
                                                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    Discount Price <span style={{ color: '#22c55e' }}>(Seasonal)</span>
                                                </label>
                                                {isEditing ? (
                                                    <div style={{ position: 'relative' }}>
                                                        <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: '#22c55e' }}>₹</span>
                                                        <input
                                                            type="number"
                                                            value={editData.discountPrice}
                                                            onChange={e => setEditData({ ...editData, discountPrice: e.target.value })}
                                                            placeholder="Optional"
                                                            style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 1.75rem', borderRadius: '8px', border: '1px solid #bbf7d0', fontWeight: 600 }}
                                                        />
                                                    </div>
                                                ) : (
                                                    selectedProduct.discountPrice ? (
                                                        <div>
                                                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e', margin: 0 }}>
                                                                ₹{Number(selectedProduct.discountPrice).toLocaleString('en-IN')}
                                                            </p>
                                                            <small style={{ color: '#64748b' }}>Seasonal Offer</small>
                                                        </div>
                                                    ) : (
                                                        <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#94a3b8', margin: 0, paddingTop: '0.25rem' }}>No active discount</p>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        {/* Stock — own full-width row */}
                                        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                                            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Inventory Level
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={editData.stock}
                                                    onChange={e => setEditData({ ...editData, stock: e.target.value })}
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 600 }}
                                                    required
                                                />
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: selectedProduct.stock > 0 ? '#22c55e' : '#ef4444', flexShrink: 0 }}></div>
                                                    <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>{selectedProduct.stock}</p>
                                                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>units in stock</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Category Field */}
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Product Category
                                            </label>
                                            {isEditing ? (
                                                <select
                                                    value={editData.category}
                                                    onChange={e => setEditData({ ...editData, category: e.target.value })}
                                                    style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', fontWeight: 500 }}
                                                    required
                                                >
                                                    <option value="Electronics">Electronics</option>
                                                    <option value="Fashion">Fashion</option>
                                                    <option value="Home & Kitchen">Home & Kitchen</option>
                                                    <option value="Handicrafts">Handicrafts</option>
                                                    <option value="Food & Beverages">Food & Beverages</option>
                                                    <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                                                    <option value="Sports & Fitness">Sports & Fitness</option>
                                                    <option value="Books & Stationery">Books & Stationery</option>
                                                    <option value="Others">Others</option>
                                                </select>
                                            ) : (
                                                <div style={{ display: 'inline-flex', padding: '0.5rem 1.25rem', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem' }}>
                                                    {selectedProduct.category}
                                                </div>
                                            )}
                                        </div>

                                        {/* Description Field */}
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                Product Description
                                            </label>
                                            {isEditing ? (
                                                <textarea
                                                    value={editData.description}
                                                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                                                    style={{ width: '100%', padding: '1rem', height: '160px', borderRadius: '12px', border: '1px solid #e2e8f0', lineHeight: 1.6, fontSize: '1rem', resize: 'vertical' }}
                                                    placeholder="Describe your product..."
                                                    required
                                                />
                                            ) : (
                                                <p style={{
                                                    color: '#334155',
                                                    fontSize: '0.95rem',
                                                    lineHeight: 1.7,
                                                    margin: 0,
                                                    padding: '1.25rem',
                                                    background: '#f8fafc',
                                                    borderRadius: '12px',
                                                    border: '1px solid #e2e8f0',
                                                    whiteSpace: 'pre-line'
                                                }}>
                                                    {selectedProduct.description}
                                                </p>
                                            )}
                                        </div>

                                        <div style={{ display: 'none' }}>{/* spacer */}</div>

                                        {isEditing && (
                                            <div className="flex gap-4" style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                                                <button
                                                    type="submit"
                                                    disabled={updateLoading}
                                                    className="btn btn-primary shadow-glow"
                                                    style={{ flex: 2, padding: '1rem', borderRadius: '14px', fontSize: '1.1rem' }}
                                                >
                                                    {updateLoading ? 'Synchronizing...' : 'Apply Changes'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsEditing(false)}
                                                    className="btn btn-secondary"
                                                    style={{ flex: 1, padding: '1rem', borderRadius: '14px' }}
                                                >
                                                    Discard
                                                </button>
                                            </div>
                                        )}
                                    </div>
=======
            {/* Add Product Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl shadow-black/20 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="px-10 pt-10 pb-6 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 text-secondary font-bold mb-2">
                                        <Plus size={18} />
                                        <span className="text-xs uppercase tracking-wider">New Listing</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900">Add New Product</h2>
                                    <p className="text-gray-500 font-medium pt-1">Reach millions of customers on Sellsathi.</p>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleAddProduct} className="flex-1 overflow-y-auto px-10 pb-10 space-y-8 scroll-smooth">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Product Title</label>
                                        <input
                                            type="text" placeholder="e.g. Handmade Silk Saree" required
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-lg font-bold text-gray-900 focus:ring-4 ring-secondary/10 transition-all outline-none"
                                            value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Price (₹)</label>
                                            <div className="relative">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-gray-300">₹</span>
                                                <input
                                                    type="number" placeholder="0.00" required
                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-lg font-black text-gray-900 focus:ring-4 ring-secondary/10 transition-all outline-none"
                                                    value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Inventory Qty</label>
                                            <input
                                                type="number" placeholder="Units" required
                                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-lg font-bold text-gray-900 focus:ring-4 ring-secondary/10 transition-all outline-none"
                                                value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Category</label>
                                        <select
                                            required
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-lg font-bold text-gray-900 focus:ring-4 ring-secondary/10 transition-all cursor-pointer outline-none appearance-none shadow-sm"
                                            value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Clothing">Clothing</option>
                                            <option value="Accessories">Accessories</option>
                                            <option value="Home Decor">Home Decor</option>
                                            <option value="Art">Art & Crafts</option>
                                            <option value="Food">Food & Beverages</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Product Media (URL)</label>
                                            <input
                                                type="text" placeholder="https://images.unsplash.com/..."
                                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium text-gray-600 focus:ring-4 ring-secondary/10 transition-all outline-none shadow-sm"
                                                value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                                            />
                                        </div>
                                        {newProduct.image && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="relative aspect-video rounded-3xl overflow-hidden border border-gray-100 shadow-xl group"
                                            >
                                                <img
                                                    src={newProduct.image}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/800x450?text=Invalid+Image+Source'; }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Description</label>
                                        <textarea
                                            placeholder="Introduce your product to potential buyers..." rows="4"
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-3xl text-sm font-medium text-gray-600 focus:ring-4 ring-secondary/10 transition-all outline-none resize-none shadow-sm"
                                            value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-end gap-3 sticky bottom-0 bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-8 py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-10 py-4 bg-secondary text-white rounded-2xl font-black shadow-xl shadow-secondary/25 hover:-translate-y-1 active:scale-95 transition-all"
                                    >
                                        Publish Listing
                                    </button>
>>>>>>> lokesh
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
