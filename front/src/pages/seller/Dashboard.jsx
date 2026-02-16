import { LayoutDashboard, Package, ShoppingBag, DollarSign, Plus, Edit2, Trash2, Truck, Loader, X, Home, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../../config/firebase';

export default function SellerDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-primary" /></div>;

    return (
        <div className="flex flex-col md:flex-row" style={{ minHeight: 'calc(100vh - 80px)', background: 'var(--background)' }}>
            {/* Mobile Header */}
            <div className="mobile-only glass-blur flex items-center justify-between" style={{ padding: '1rem 1.5rem', position: 'sticky', top: '80px', zIndex: 100 }}>
                <h3 style={{ margin: 0 }}>Seller Portal</h3>
                <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }}
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu size={20} />
                </button>
            </div>

            {/* Sidebar Navigation */}
            <AnimatePresence mode="wait">
                {(isSidebarOpen || window.innerWidth > 768) && (
                    <motion.aside
                        key="sidebar"
                        initial={window.innerWidth <= 768 ? { x: '-100%' } : { x: 0 }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`${window.innerWidth <= 768 ? 'fixed' : 'sticky'} glass-card flex flex-col`}
                        style={{
                            width: window.innerWidth <= 768 ? '85%' : '280px',
                            maxWidth: '300px',
                            height: window.innerWidth <= 768 ? '100vh' : 'calc(100vh - 80px)',
                            top: window.innerWidth <= 768 ? 0 : '80px',
                            left: 0,
                            zIndex: 1000,
                            borderRadius: window.innerWidth <= 768 ? 0 : '0 2rem 2rem 0',
                            border: 'none',
                            padding: '2rem 1.5rem',
                            boxShadow: '10px 0 40px rgba(0,0,0,0.03)'
                        }}
                    >
                        <div className="flex justify-between items-center mb-10">
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>Seller <span className="gradient-text">Portal</span></h3>
                            <button className="mobile-only btn btn-secondary" onClick={() => setIsSidebarOpen(false)} style={{ borderRadius: '50%', padding: '0.4rem' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-2">
                            <Link
                                to="/"
                                className="btn btn-secondary"
                                style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem', borderRadius: '1rem', border: 'none' }}
                            >
                                <Home size={20} /> Home View
                            </Link>

                            <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />

                            {[
                                { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Overview' },
                                { id: 'products', icon: <Package size={20} />, label: 'Inventory' },
                                { id: 'orders', icon: <ShoppingBag size={20} />, label: 'Orders' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{
                                        width: '100%',
                                        justifyContent: 'flex-start',
                                        gap: '0.75rem',
                                        borderRadius: '1rem',
                                        border: 'none',
                                        background: activeTab === tab.id ? undefined : 'transparent',
                                        boxShadow: activeTab === tab.id ? undefined : 'none'
                                    }}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setIsSidebarOpen(false);
                                    }}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'var(--primary-soft)', borderRadius: '1.25rem' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>DASHBOARD V2.0</p>
                            <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: 0 }}>Advanced analytics and inventory tools enabled.</p>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                <header style={{ marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }}>
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </h1>
                    <p className="text-muted" style={{ fontSize: '1.1rem' }}>Manage your artisanal business and track performance.</p>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div 
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col gap-8"
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                                {statCards.map((s, i) => (
                                    <div key={i} className="glass-card flex flex-col gap-4" style={{ padding: '1.5rem' }}>
                                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: s.color + '22', color: s.color, width: 'fit-content' }}>
                                            {s.icon}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{s.value}</h3>
                                            <p className="text-muted" style={{ fontSize: '0.95rem' }}>{s.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="glass-card flex flex-col items-center justify-center text-center" style={{ padding: '4rem 2rem', border: '1px dashed var(--border)' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                                    <LayoutDashboard size={32} />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Performance Insights</h3>
                                <p className="text-muted" style={{ maxWidth: '500px' }}>Advanced sales charts and customer behavior analytics are being generated for your shop.</p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'products' && (
                        <motion.div 
                            key="products"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col gap-6"
                        >
                            <div className="flex justify-between items-center bg-white" style={{ padding: '1rem 1.5rem', borderRadius: '1.25rem', border: '1px solid var(--border)' }}>
                                <h3 style={{ margin: 0 }}>Store Inventory ({products.length})</h3>
                                <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ borderRadius: '999px' }}>
                                    <Plus size={18} /> Add Product
                                </button>
                            </div>

                            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                                {products.length === 0 ? (
                                    <div className="p-20 text-center">
                                        <Package size={48} className="text-muted mb-4" />
                                        <p>No products listed yet.</p>
                                    </div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: 'var(--surface)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                                <tr>
                                                    <th style={{ padding: '1.25rem' }}>Product</th>
                                                    <th>Category</th>
                                                    <th>Price</th>
                                                    <th>Stock</th>
                                                    <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products.map(p => (
                                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                        <td style={{ padding: '1.25rem' }}>
                                                            <div className="flex items-center gap-4">
                                                                <img src={p.image || 'https://via.placeholder.com/50'} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                                                                <span style={{ fontWeight: 600 }}>{p.title}</span>
                                                            </div>
                                                        </td>
                                                        <td className="text-muted">{p.category}</td>
                                                        <td style={{ fontWeight: 700 }}>₹{p.price}</td>
                                                        <td>
                                                            <span style={{ fontSize: '0.85rem', padding: '4px 10px', background: p.stock > 0 ? 'var(--success)11' : 'var(--error)11', color: p.stock > 0 ? 'var(--success)' : 'var(--error)', borderRadius: '999px', fontWeight: 700 }}>
                                                                {p.stock} Units
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                                            <button 
                                                                className="btn btn-secondary" 
                                                                style={{ padding: '0.4rem', color: 'var(--error)', border: 'none' }}
                                                                onClick={() => handleDeleteProduct(p.id)}
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'orders' && (
                        <motion.div 
                            key="orders"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col gap-6"
                        >
                             <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                                {orders.length === 0 ? (
                                    <div className="p-20 text-center">
                                        <ShoppingBag size={48} className="text-muted mb-4" />
                                        <p>No customer orders yet.</p>
                                    </div>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead style={{ background: 'var(--surface)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                                <tr>
                                                    <th style={{ padding: '1.25rem' }}>Order ID</th>
                                                    <th>Customer</th>
                                                    <th>Total</th>
                                                    <th>Status</th>
                                                    <th style={{ padding: '1.25rem', textAlign: 'right' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map(o => (
                                                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                        <td style={{ padding: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>#{o.orderId}</td>
                                                        <td>{o.customer}</td>
                                                        <td style={{ fontWeight: 700 }}>₹{o.total}</td>
                                                        <td>
                                                            <span style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, background: o.status === 'Delivered' ? 'var(--success)11' : 'var(--warning)11', color: o.status === 'Delivered' ? 'var(--success)' : 'var(--warning)' }}>
                                                                {o.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                                            <button onClick={() => handleUpdateStatus(o.id, o.status)} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                                                                Update
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Add Product Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card" 
                            style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', background: 'white' }}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 style={{ margin: 0 }}>Add New Product</h2>
                                    <p className="text-muted">List your artisanal masterpiece.</p>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="btn btn-secondary" style={{ borderRadius: '50%', padding: '0.5rem' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleAddProduct} className="flex flex-col gap-6">
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Product Title</label>
                                    <input type="text" required value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} style={{ width: '100%' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Price (₹)</label>
                                        <input type="number" required value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} style={{ width: '100%' }} />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Stock</label>
                                        <input type="number" required value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} style={{ width: '100%' }} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Category</label>
                                    <select required value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} style={{ width: '100%' }}>
                                        <option value="">Select Category</option>
                                        <option value="Clothing">Clothing</option>
                                        <option value="Home Decor">Home Decor</option>
                                        <option value="Art">Art & Crafts</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Image URL</label>
                                    <input type="text" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} placeholder="Paste link..." style={{ width: '100%' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Description</label>
                                    <textarea rows="4" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} style={{ width: '100%' }} />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ padding: '1rem', borderRadius: '1rem' }}>Launch Product</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
