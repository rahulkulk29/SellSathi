import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingBag, DollarSign, Plus, Edit2, Trash2, Truck, Loader, X, Home, Upload, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../config/firebase';

export default function SellerDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

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
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const uid = user.uid;

                // Unified fetch for maximum performance (1 request instead of 4)
                const response = await fetch(`http://localhost:5000/seller/${uid}/dashboard-data`);
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
        });

        return () => unsubscribe();
    }, []);



    const handleViewProduct = (product) => {
        setSelectedProduct(product);
        setEditData({ ...product });
        setIsEditing(false);
        setShowViewModal(true);
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        setUpdateLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/seller/product/update/${selectedProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sellerId: user.uid,
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

    const handleUpdateStatus = async (orderId, currentStatus) => {
        const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
        const newStatus = statuses[nextIndex];

        try {
            const response = await fetch(`http://localhost:5000/seller/order/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
        { label: 'Total Sales', value: `₹${stats.totalSales.toLocaleString()}`, icon: <DollarSign />, color: 'var(--success)' },
        { label: 'Active Products', value: stats.totalProducts, icon: <Package />, color: 'var(--primary)' },
        { label: 'New Orders', value: stats.newOrders, icon: <ShoppingBag />, color: 'var(--secondary)' },
        { label: 'Pending', value: stats.pendingOrders, icon: <Truck />, color: 'var(--warning)' },
    ];

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen gap-4" style={{ background: 'var(--background)' }}>
                <Loader className="animate-spin" size={40} color="var(--primary)" />
                <p style={{ fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>Initializing your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="flex" style={{ minHeight: 'calc(100vh - 80px)', width: '100%', gap: '2rem', padding: '2rem' }}>
            {/* Sidebar */}
            <aside className="glass-card flex flex-col justify-between" style={{ width: '280px', height: 'calc(100vh - 120px)', padding: '1.5rem', position: 'sticky', top: '2rem' }}>
                <div>
                    <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>Seller Portal</h3>
                    <nav className="flex flex-col gap-2">
                        <Link
                            to="/"
                            className="btn btn-secondary"
                            style={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                textTransform: 'capitalize',
                                padding: '1rem',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem'
                            }}
                        >
                            <Home size={20} />
                            Home
                        </Link>
                        {['overview', 'products', 'orders'].map(tab => (
                            <button
                                key={tab}
                                className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                                style={{
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    textTransform: 'capitalize',
                                    padding: '1rem',
                                    fontSize: '1rem'
                                }}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'overview' && <LayoutDashboard size={20} />}
                                {tab === 'products' && <Package size={20} />}
                                {tab === 'orders' && <ShoppingBag size={20} />}
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                <div style={{ marginTop: 'auto', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
                    <small className="text-muted">Need Help?</small>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Contact Sellsathi Support for assistance.</p>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col" style={{ height: '100%', gap: '2rem' }}>
                <div className="glass-card flex justify-between items-center" style={{ padding: '1.5rem 2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Welcome back, <span className="gradient-text">{profile.name}</span>!</h2>
                        <p className="text-muted">Here's what's happening with your store today.</p>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div className="animate-fade-in flex flex-col" style={{ gap: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                            {statCards.map((s, i) => (
                                <div key={i} className="glass-card flex flex-col justify-center gap-4" style={{ minHeight: '180px', padding: '1.5rem' }}>
                                    <div className="flex items-start justify-between">
                                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: s.color + '22', color: s.color }}>
                                            {s.icon}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>{s.value}</h3>
                                        <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>{s.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Store Performance Placeholder */}
                        <div className="glass-card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Store Performance</h3>
                            <p className="text-muted" style={{ maxWidth: '600px' }}>
                                Your sales analytics and performance charts will appear here as your store grows. Keep adding quality products!
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="animate-fade-in flex flex-col gap-4" style={{ height: '100%' }}>
                        <div className="flex justify-between items-center mb-4">
                            <h3>Manage Products ({products.length})</h3>
                            <button className="btn btn-primary" onClick={() => navigate('/seller/add-product')} style={{ padding: '0.75rem 1.5rem' }}>
                                <Plus size={20} /> Add New Product
                            </button>
                        </div>

                        <div className="glass-card flex-1" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            {products.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                                    <Package size={64} className="text-muted mb-4" />
                                    <h3>No Products Yet</h3>
                                    <p className="text-muted mb-4">Start selling by adding your first product using the button above.</p>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto', flex: 1 }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: 'var(--surface)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                            <tr>
                                                <th style={{ padding: '1.25rem' }}>Product Details</th>
                                                <th>Category</th>
                                                <th>Price</th>
                                                <th>Stock</th>
                                                <th style={{ padding: '1.25rem' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(p => (
                                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '1.25rem' }}>
                                                        <div className="flex items-center gap-4">
                                                            {p.image ? (
                                                                <img src={p.image} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                                                            ) : (
                                                                <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <Package size={20} className="text-muted" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p style={{ fontWeight: 600 }}>{p.title}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{ background: 'var(--surface)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' }}>
                                                            {p.category}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontWeight: 600 }}>₹{p.price}</td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.stock > 0 ? 'var(--success)' : 'var(--error)' }}></div>
                                                            {p.stock || 0} in stock
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem' }}>
                                                        <div className="flex gap-2">
                                                            <button
                                                                className="btn btn-secondary"
                                                                style={{ padding: '0.5rem', color: 'var(--primary)', borderColor: 'var(--primary)22' }}
                                                                onClick={() => handleViewProduct(p)}
                                                                title="See Product Details"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                            <button
                                                                className="btn btn-secondary"
                                                                style={{ padding: '0.5rem', color: 'var(--error)', borderColor: 'var(--error)22', background: 'var(--error)11' }}
                                                                onClick={() => handleDeleteProduct(p.id)}
                                                                title="Delete Product"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="animate-fade-in flex flex-col gap-4" style={{ height: '100%' }}>
                        <div className="mb-4">
                            <h3>Customer Orders ({orders.length})</h3>
                        </div>

                        <div className="glass-card flex-1" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            {orders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                                    <ShoppingBag size={64} className="text-muted mb-4" />
                                    <h3>No Orders Yet</h3>
                                    <p className="text-muted">Orders will appear here once customers start buying your products.</p>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto', flex: 1 }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: 'var(--surface)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                            <tr>
                                                <th style={{ padding: '1.25rem' }}>Order ID</th>
                                                <th>Customer</th>
                                                <th>Total Amount</th>
                                                <th>Status</th>
                                                <th style={{ padding: '1.25rem' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(o => (
                                                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '1.25rem', fontFamily: 'monospace', fontWeight: 600 }}>#{o.orderId}</td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                                                                {o.customer.charAt(0)}
                                                            </div>
                                                            {o.customer}
                                                        </div>
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
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

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
                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-6">
                                            {/* Title Field */}
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    Product Title:
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editData.title}
                                                        onChange={e => setEditData({ ...editData, title: e.target.value })}
                                                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 600, borderRadius: '12px', border: '1px solid var(--border)' }}
                                                        required
                                                    />
                                                ) : (
                                                    <h3 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text)', lineHeight: 1.2 }}>
                                                        {selectedProduct.title}
                                                    </h3>
                                                )}
                                            </div>

                                            {/* Details Grid */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                        Retail Price:
                                                    </label>
                                                    {isEditing ? (
                                                        <div style={{ position: 'relative' }}>
                                                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, color: 'var(--primary)' }}>₹</span>
                                                            <input
                                                                type="number"
                                                                value={editData.price}
                                                                onChange={e => setEditData({ ...editData, price: e.target.value })}
                                                                style={{ width: '100%', padding: '0.875rem 0.875rem 0.875rem 2rem', borderRadius: '10px', border: '1px solid var(--border)', fontWeight: 600 }}
                                                                required
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>₹{Number(selectedProduct.price).toLocaleString('en-IN')}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                        Inventory Level:
                                                    </label>
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            value={editData.stock}
                                                            onChange={e => setEditData({ ...editData, stock: e.target.value })}
                                                            style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', border: '1px solid var(--border)', fontWeight: 600 }}
                                                            required
                                                        />
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '100%' }}>
                                                            <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{selectedProduct.stock}</p>
                                                            <span className="text-muted">Units Available</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Category Field */}
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    Product Category:
                                                </label>
                                                {isEditing ? (
                                                    <select
                                                        value={editData.category}
                                                        onChange={e => setEditData({ ...editData, category: e.target.value })}
                                                        style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', fontWeight: 500 }}
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
                                                    <div style={{ display: 'inline-flex', padding: '0.5rem 1rem', background: 'var(--primary)15', color: 'var(--primary)', borderRadius: '8px', fontWeight: 600 }}>
                                                        {selectedProduct.category}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Description Field */}
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                    Product Description:
                                                </label>
                                                {isEditing ? (
                                                    <textarea
                                                        value={editData.description}
                                                        onChange={e => setEditData({ ...editData, description: e.target.value })}
                                                        style={{ width: '100%', padding: '1rem', height: '180px', borderRadius: '12px', border: '1px solid var(--border)', lineHeight: 1.6, fontSize: '1rem' }}
                                                        placeholder="Describe your product..."
                                                        required
                                                    />
                                                ) : (
                                                    <p style={{
                                                        color: 'var(--text)',
                                                        fontSize: '1rem',
                                                        lineHeight: 1.7,
                                                        margin: 0,
                                                        padding: '1.5rem',
                                                        background: 'var(--surface)',
                                                        borderRadius: '16px',
                                                        border: '1px solid var(--border)',
                                                        whiteSpace: 'pre-line'
                                                    }}>
                                                        {selectedProduct.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

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
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
