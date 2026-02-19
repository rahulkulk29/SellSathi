import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingBag, DollarSign, Plus,
    Edit2, Trash2, Truck, Loader, X, Sparkles, BarChart3,
    TrendingUp, Search, Filter, Download
} from 'lucide-react';
import { auth } from '../../config/firebase';

export default function SellerDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
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

    // Data States
    const [stats, setStats] = useState({ totalSales: 0, totalProducts: 0, newOrders: 0, pendingOrders: 0 });
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ title: '', price: '', category: '', stock: '', description: '', image: '' });

    useEffect(() => {
        const fetchSellerData = async () => {
            const user = auth.currentUser;
            if (!user) return; // Should be handled by ProtectedRoute

            try {
                setLoading(true);
                const uid = user.uid;

                // Fetch Stats
                const statsRes = await fetch(`http://localhost:5000/seller/${uid}/stats`);
                const statsData = await statsRes.json();
                if (statsData.success) setStats(statsData.stats);

                // Fetch Products
                const prodRes = await fetch(`http://localhost:5000/seller/${uid}/products`);
                const prodData = await prodRes.json();
                if (prodData.success) setProducts(prodData.products);

                // Fetch Orders
                const ordRes = await fetch(`http://localhost:5000/seller/${uid}/orders`);
                const ordData = await ordRes.json();
                if (ordData.success) setOrders(ordData.orders);

            } catch (error) {
                console.error("Error fetching seller data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSellerData();
    }, []);

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        try {
            const response = await fetch('http://localhost:5000/seller/product/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sellerId: user.uid,
                    productData: {
                        ...newProduct,
                        price: parseFloat(newProduct.price),
                        stock: parseInt(newProduct.stock)
                    }
                })
            });

            const data = await response.json();
            if (data.success) {
                alert("Product added successfully!");
                setShowAddModal(false);
                setNewProduct({ title: '', price: '', category: '', stock: '', description: '', image: '' });
                // Refresh products
                const prodRes = await fetch(`http://localhost:5000/seller/${user.uid}/products`);
                const prodData = await prodRes.json();
                if (prodData.success) setProducts(prodData.products);
            } else {
                alert("Failed: " + data.message);
            }
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Error adding product");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const response = await fetch(`http://localhost:5000/seller/product/${id}`, { method: 'DELETE' });
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

    const statCards = [
        { label: 'Total Sales', value: `₹${stats.totalSales?.toLocaleString('en-IN') || 0}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
        { label: 'Active Products', value: stats.totalProducts || 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
        { label: 'New Orders', value: stats.newOrders || 0, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
        { label: 'Pending', value: stats.pendingOrders || 0, icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-white/50 backdrop-blur-sm">
                <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading your dashboard...</p>
            </div>
        );
    }

    return (
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
                    </div>
                </div>
                {/* Decorative background blur */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[100px] -mr-32 -mt-32 rounded-full group-hover:bg-secondary/10 transition-colors"></div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
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
                                </div>
                            ))}
                        </div>

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
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'products' && (
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
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
