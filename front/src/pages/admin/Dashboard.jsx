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
            <main className="flex-1" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', gap: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }}>Commander</h1>
                        <p className="text-muted" style={{ fontSize: '1.1rem' }}>Global administrative overview and control center.</p>
                    </div>
                    <div className="glass-card flex items-center gap-3 p-2 bg-white" style={{ borderRadius: '1rem', border: '1px solid var(--border)' }}>
                        <div className="flex items-center gap-2 px-3 border-r border-border">
                            <Search size={18} className="text-muted" />
                            <input 
                                type="text" 
                                placeholder="Global search..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ border: 'none', background: 'none', padding: '0.4rem', outline: 'none', width: '180px' }}
                            />
                        </div>
                        <button onClick={fetchAllData} className="btn btn-secondary" style={{ padding: '0.5rem', minWidth: '40px' }}>
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    {statSpecs.map((s, i) => (
                        <div key={i} className="glass-card flex flex-col gap-4" style={{ padding: '1.5rem' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '12px', background: s.color + '11', color: s.color, width: 'fit-content' }}>
                                {s.icon}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{loading ? '...' : s.value}</h3>
                                <p className="text-muted" style={{ fontSize: '0.95rem', fontWeight: 600 }}>{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'sellers' && (
                        <motion.div key="sellers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 style={{ margin: 0, fontWeight: 800 }}>Approval Queue ({filteredSellers.length})</h3>
                            </div>
                            {filteredSellers.length === 0 ? (
                                <div className="glass-card text-center p-20 text-muted">No pending seller registrations.</div>
                            ) : (
                                <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: 'var(--surface)', textAlign: 'left' }}>
                                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                <th style={{ padding: '1.25rem' }}>Shop Details</th>
                                                <th>Identification</th>
                                                <th>Category</th>
                                                <th style={{ padding: '1.25rem', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSellers.map(s => (
                                                <tr key={s.uid} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '1.25rem' }}>
                                                        <span style={{ fontWeight: 800 }}>{s.shopName}</span><br />
                                                        <small className="text-muted">{s.address}</small>
                                                    </td>
                                                    <td className="text-muted" style={{ fontSize: '0.9rem' }}>{s.email}</td>
                                                    <td>
                                                        <span style={{ padding: '4px 10px', background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>
                                                            {s.category}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.25rem', textAlign: 'right' }}>
                                                        <div className="flex gap-2 justify-end">
                                                            <button className="btn btn-secondary" onClick={() => handleApproveSeller(s.uid)} style={{ color: 'var(--success)', padding: '0.5rem' }}>
                                                                <Check size={18} />
                                                            </button>
                                                            <button className="btn btn-secondary" onClick={() => handleRejectSeller(s.uid)} style={{ color: 'var(--error)', padding: '0.5rem' }}>
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
                            <h3 style={{ margin: 0, fontWeight: 800 }}>Marketplace Inventory ({filteredProducts.length})</h3>
                            <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'var(--surface)', textAlign: 'left' }}>
                                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '1.25rem' }}>Product Title</th>
                                            <th>Merchant</th>
                                            <th>Revenue Point</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map(p => (
                                            <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1.25rem', fontWeight: 600 }}>{p.title}</td>
                                                <td className="text-muted">{p.seller}</td>
                                                <td style={{ fontWeight: 800 }}>₹{p.price}</td>
                                                <td>
                                                    <span style={{ padding: '4px 10px', background: 'var(--success)11', color: 'var(--success)', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>
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
                             <h3 style={{ margin: 0, fontWeight: 800 }}>Network Transactions ({filteredOrders.length})</h3>
                            <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'var(--surface)', textAlign: 'left' }}>
                                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                            <th style={{ padding: '1.25rem' }}>Order Context</th>
                                            <th>Value</th>
                                            <th>Workflow</th>
                                            <th>Timeline</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map(o => (
                                            <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1.25rem' }}>
                                                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>#{o.orderId}</span><br />
                                                    <small className="text-muted">{o.customer}</small>
                                                </td>
                                                <td style={{ fontWeight: 800 }}>₹{o.total.toLocaleString()}</td>
                                                <td>
                                                    <span style={{ padding: '4px 10px', background: 'var(--primary-soft)', color: 'var(--primary)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                                                        {o.status}
                                                    </span>
                                                </td>
                                                <td className="text-muted" style={{ fontSize: '0.9rem' }}>{o.date}</td>
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
