import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Box, ShoppingCart, Truck, Check, X, AlertOctagon, Loader, Home, Menu, Search, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('sellers');
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [error, setError] = useState('');

    // Data states
    const [stats, setStats] = useState({ totalSellers: 0, totalProducts: 0, todayOrders: 0, pendingApprovals: 0 });
    const [sellers, setSellers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    // Fetch all data on component mount
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch stats
            const statsRes = await fetch('http://localhost:5000/admin/stats');
            const statsData = await statsRes.json();
            if (statsData.success) setStats(statsData.stats);

            // Fetch sellers
            const sellersRes = await fetch('http://localhost:5000/admin/sellers');
            const sellersData = await sellersRes.json();
            if (sellersData.success) setSellers(sellersData.sellers);

            // Fetch products
            const productsRes = await fetch('http://localhost:5000/admin/products');
            const productsData = await productsRes.json();
            if (productsData.success) setProducts(productsData.products);

            // Fetch orders
            const ordersRes = await fetch('http://localhost:5000/admin/orders');
            const ordersData = await ordersRes.json();
            if (ordersData.success) setOrders(ordersData.orders);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('System connectivity issue. Please verify backend status.');
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
                alert('Seller approved successfully!');
                fetchAllData(); // Refresh data
            } else {
                alert('Failed to approve seller: ' + data.message);
            }
        } catch (err) {
            console.error('Error approving seller:', err);
            alert('Error approving seller');
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
                alert('Seller rejected successfully!');
                fetchAllData(); // Refresh data
            } else {
                alert('Failed to reject seller: ' + data.message);
            }
        } catch (err) {
            console.error('Error rejecting seller:', err);
            alert('Error rejecting seller');
        }
    };

    const [searchTerm, setSearchTerm] = useState('');

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

    if (error) {
        return (
            <div className="container flex flex-col items-center justify-center" style={{ minHeight: '80vh', padding: '2rem' }}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card text-center" 
                    style={{ padding: '3rem', maxWidth: '500px' }}
                >
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--error)11', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <AlertOctagon size={40} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Connectivity Error</h3>
                    <p className="text-muted mb-6">{error}</p>
                    <button className="btn btn-primary" onClick={fetchAllData}>
                        Retry Connection
                    </button>
                </motion.div>
            </div>
        );
    }

    const statSpecs = [
        { label: 'Total Sellers', value: stats.totalSellers, icon: <Users size={24} />, color: 'var(--primary)' },
        { label: 'Market Products', value: stats.totalProducts, icon: <Box size={24} />, color: 'var(--secondary)' },
        { label: 'Daily Volume', value: stats.todayOrders, icon: <ShoppingCart size={24} />, color: 'var(--success)' },
        { label: 'Approvals', value: stats.pendingApprovals, icon: <ShieldCheck size={24} />, color: 'var(--warning)' },
    ];

    if (loading && !stats.totalSellers) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-primary" /></div>;

    return (
        <div className="flex flex-col md:flex-row" style={{ minHeight: 'calc(100vh - 80px)', background: 'var(--background)' }}>
            {/* Mobile Admin Header */}
            <div className="mobile-only glass-blur flex items-center justify-between" style={{ padding: '1rem 1.5rem', position: 'sticky', top: '80px', zIndex: 100 }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                    <ShieldCheck size={24} />
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Admin Panel</h3>
                </div>
                <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }}
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu size={20} />
                </button>
            </div>

            {/* Admin Sidebar */}
            <AnimatePresence mode="wait">
                {(isSidebarOpen || window.innerWidth > 768) && (
                    <motion.aside
                        key="admin-sidebar"
                        initial={window.innerWidth <= 768 ? { x: '-100%' } : { x: 0 }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`${window.innerWidth <= 768 ? 'fixed' : 'sticky'} flex flex-col`}
                        style={{
                            width: window.innerWidth <= 768 ? '85%' : '280px',
                            maxWidth: '300px',
                            height: window.innerWidth <= 768 ? '100vh' : 'calc(100vh - 80px)',
                            top: window.innerWidth <= 768 ? 0 : '80px',
                            left: 0,
                            zIndex: 1000,
                            borderRadius: window.innerWidth <= 768 ? 0 : '0 1rem 1rem 0',
                            border: 'none',
                            padding: '2rem 1.5rem',
                            background: '#ffffff',
                            boxShadow: '4px 0 20px rgba(0,0,0,0.04)'
                        }}
                    >
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-2 text-primary">
                                <ShieldCheck size={28} />
                                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>Admin</h3>
                            </div>
                            <button className="mobile-only btn btn-secondary" onClick={() => setIsSidebarOpen(false)} style={{ borderRadius: '50%', padding: '0.4rem' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-2">
                             <Link
                                to="/"
                                className="btn btn-secondary"
                                style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem', borderRadius: '1rem', border: 'none' }}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <Home size={20} /> Live Site
                            </Link>

                            <div style={{ height: '1px', background: 'var(--border)', margin: '1rem 0' }} />

                             {[
                                { id: 'sellers', icon: <Users size={20} />, label: 'Seller Mgmt' },
                                { id: 'products', icon: <Box size={20} />, label: 'Marketplace' },
                                { id: 'orders', icon: <ShoppingCart size={20} />, label: 'Transactions' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    className={`btn ${activeTab === tab.id ? 'btn-primary' : ''}`}
                                    style={{
                                        width: '100%',
                                        justifyContent: 'flex-start',
                                        gap: '0.75rem',
                                        borderRadius: '0.85rem',
                                        border: 'none',
                                        background: activeTab === tab.id ? 'var(--primary-gradient)' : 'transparent',
                                        color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                                        boxShadow: activeTab === tab.id ? 'var(--glow-shadow)' : 'none',
                                        fontWeight: activeTab === tab.id ? 700 : 500,
                                        padding: '0.85rem 1.25rem'
                                    }}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setSearchTerm('');
                                        setIsSidebarOpen(false);
                                    }}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        <div style={{ marginTop: 'auto', padding: '1.5rem', background: 'var(--surface)', borderRadius: '1.25rem' }}>
                            <small className="text-muted" style={{ fontWeight: 700 }}>SYSTEM STATUS</small>
                            <div className="flex items-center gap-2 mt-2" style={{ color: 'var(--success)', fontWeight: 600 }}>
                                <div className="pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></div>
                                Operational
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Admin Main Content */}
            <main className="flex-1" style={{ padding: '2.5rem', width: '100%', minWidth: 0 }}>
                <header style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-end', 
                    marginBottom: '2rem', 
                    gap: '1.5rem',
                    padding: '1.5rem 2rem',
                    margin: '-1rem -2.5rem 2rem -2.5rem',
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid var(--border)',
                    position: 'sticky',
                    top: '-1px',
                    zIndex: 90
                }}>
                    <div>
                        <h1 style={{ fontSize: '2.25rem', fontWeight: '900', letterSpacing: '-0.04em', margin: 0, color: 'var(--text)' }}>Commander</h1>
                        <p className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>Global administrative overview and control center.</p>
                    </div>
                    <div className="glass-card flex items-center gap-3 p-1.5 bg-white" style={{ borderRadius: '999px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <div className="flex items-center gap-2 px-4 border-r border-border">
                            <Search size={18} className="text-muted" style={{ opacity: 0.5 }} />
                            <input 
                                type="text" 
                                placeholder="Global search..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ border: 'none', background: 'none', padding: '0.5rem 0', outline: 'none', width: '180px', fontSize: '0.9rem', fontWeight: 500 }}
                            />
                        </div>
                        <button onClick={fetchAllData} className="btn btn-secondary" style={{ padding: '0.5rem', minWidth: '40px', borderRadius: '50%', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} style={{ color: 'var(--text-muted)' }} />
                        </button>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    {statSpecs.map((s, i) => (
                        <motion.div 
                            key={i} 
                            whileHover={{ translateY: -6, boxShadow: 'var(--shadow-premium)' }}
                            className="glass-card flex flex-col gap-4" 
                            style={{ 
                                padding: '1.75rem', 
                                background: '#ffffff', 
                                borderRadius: '1.25rem', 
                                boxShadow: 'var(--shadow-layered)',
                                border: '1px solid rgba(0,0,0,0.02)' 
                            }}
                        >
                            <div style={{ padding: '0.75rem', borderRadius: '12px', background: s.color + '11', color: s.color, width: 'fit-content' }}>
                                {s.icon}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: 'var(--text)', letterSpacing: '-0.02em' }}>{loading ? '...' : s.value}</h3>
                                <p className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 600, opacity: 0.7 }}>{s.label.toUpperCase()}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'sellers' && (
                        <motion.div key="sellers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 style={{ margin: 0, fontWeight: 800, color: 'var(--text)' }}>Approval Queue ({filteredSellers.length})</h3>
                            </div>
                            {filteredSellers.length === 0 ? (
                                <div className="glass-card text-center p-20 text-muted" style={{ background: '#ffffff', borderRadius: '1.25rem', boxShadow: 'var(--shadow-layered)' }}>No pending seller registrations.</div>
                            ) : (
                                <div className="glass-card" style={{ padding: 0, overflowX: 'auto', background: '#ffffff', borderRadius: '1.25rem', boxShadow: 'var(--shadow-layered)', border: '1px solid rgba(0,0,0,0.02)' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: '#f8fafc', textAlign: 'left' }}>
                                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shop Details</th>
                                                <th style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identification</th>
                                                <th style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                                                <th style={{ padding: '1.25rem', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSellers.map(s => (
                                                <tr key={s.uid} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                                                    <td style={{ padding: '1.25rem' }}>
                                                        <span style={{ fontWeight: 800, color: 'var(--text)' }}>{s.shopName}</span><br />
                                                        <small className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{s.address}</small>
                                                    </td>
                                                    <td className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500 }}>{s.email}</td>
                                                    <td>
                                                        <span style={{ padding: '4px 12px', background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                            {s.category}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                                        <div className="flex gap-2 justify-end">
                                                            <button className="btn btn-secondary" onClick={() => handleApproveSeller(s.uid)} style={{ color: 'var(--success)', padding: '0.5rem', background: 'var(--success)11', border: 'none' }}>
                                                                <Check size={18} />
                                                            </button>
                                                            <button className="btn btn-secondary" onClick={() => handleRejectSeller(s.uid)} style={{ color: 'var(--error)', padding: '0.5rem', background: 'var(--error)11', border: 'none' }}>
                                                                <X size={18} />
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

                    {activeTab === 'products' && (
                        <motion.div key="products" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-4">
                            <h3 style={{ margin: 0, fontWeight: 800, color: 'var(--text)' }}>Marketplace Inventory ({filteredProducts.length})</h3>
                            <div className="glass-card" style={{ padding: 0, overflowX: 'auto', background: '#ffffff', borderRadius: '1.25rem', boxShadow: 'var(--shadow-layered)', border: '1px solid rgba(0,0,0,0.02)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: '#f8fafc', textAlign: 'left' }}>
                                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Title</th>
                                            <th style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Merchant</th>
                                            <th style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue Point</th>
                                            <th style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map(p => (
                                            <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                                                <td style={{ padding: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>{p.title}</td>
                                                <td className="text-muted" style={{ fontWeight: 500 }}>{p.seller}</td>
                                                <td style={{ fontWeight: 900, color: 'var(--text)' }}>₹{p.price}</td>
                                                <td>
                                                    <span style={{ padding: '4px 12px', background: 'var(--success)11', color: 'var(--success)', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                                                        {p.status || 'Active'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'orders' && (
                        <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-4">
                             <h3 style={{ margin: 0, fontWeight: 800, color: 'var(--text)' }}>Network Transactions ({filteredOrders.length})</h3>
                            <div className="glass-card" style={{ padding: 0, overflowX: 'auto', background: '#ffffff', borderRadius: '1.25rem', boxShadow: 'var(--shadow-layered)', border: '1px solid rgba(0,0,0,0.02)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: '#f8fafc', textAlign: 'left' }}>
                                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Context</th>
                                            <th style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Value</th>
                                            <th style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Workflow</th>
                                            <th style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeline</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map(o => (
                                            <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                                                <td style={{ padding: '1.25rem' }}>
                                                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>#{o.orderId}</span><br />
                                                    <small className="text-muted" style={{ fontWeight: 600 }}>{o.customer}</small>
                                                </td>
                                                <td style={{ fontWeight: 900, color: 'var(--text)' }}>₹{o.total.toLocaleString()}</td>
                                                <td>
                                                    <span style={{ padding: '4px 12px', background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                                                        {o.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>{o.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
