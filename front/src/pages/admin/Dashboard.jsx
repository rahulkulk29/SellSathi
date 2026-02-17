import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Box, ShoppingCart, Truck, Check, X, AlertOctagon, Loader, Home, User, Mail, MapPin, Store, CreditCard, Calendar } from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('sellers');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Data states
    const [stats, setStats] = useState({ totalSellers: 0, totalProducts: 0, todayOrders: 0, pendingApprovals: 0 });
    const [sellers, setSellers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [selectedSeller, setSelectedSeller] = useState(null);

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
            setError('Failed to load dashboard data. Please refresh.');
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

    const StatCard = ({ label, value, icon, color }) => (
        <div className="glass-card flex flex-col justify-center gap-4" style={{ minHeight: '180px' }}>
            <div className="flex justify-between items-start">
                <div style={{ padding: '0.75rem', borderRadius: '12px', background: `${color}22`, color: color }}>
                    {icon}
                </div>
                {/* <span className="text-muted" style={{ fontSize: '0.8rem' }}>+2.5%</span> */}
            </div>
            <div>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>{loading ? '-' : value}</h3>
                <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>{label}</p>
            </div>
        </div>
    );

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

    // Render Helpers
    const renderSellersTable = () => (
        <div className="animate-fade-in flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h3>Pending Approvals ({filteredSellers.length})</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search sellers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                    />
                    <button className="btn btn-secondary" onClick={fetchAllData}>Refresh</button>
                </div>
            </div>
            {filteredSellers.length === 0 ? (
                <div className="glass-card text-center p-8 text-muted">No pending seller approvals found.</div>
            ) : (
                <div className="glass-card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead style={{ background: 'var(--surface)', textAlign: 'left' }}>
                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shop Identity</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Info</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Verification</th>
                                <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Quick Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSellers.map(s => (
                                <tr
                                    key={s.uid}
                                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div className="flex flex-col">
                                            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{s.shopName}</span>
                                            <span className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>{s.address?.substring(0, 40)}...</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <span style={{ padding: '4px 10px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                                            {s.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div className="flex flex-col">
                                            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{s.email}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>UID: {s.uid?.substring(0, 8)}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                        <button
                                            className="btn btn-secondary shadow-sm"
                                            onClick={() => setSelectedSeller(s)}
                                            style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700, borderRadius: '8px', gap: '6px' }}
                                        >
                                            <Box size={14} /> Review Data
                                        </button>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div className="flex gap-3 justify-end">
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => handleApproveSeller(s.uid)}
                                                title="Quick Approve"
                                                style={{ color: 'var(--success)', width: '38px', height: '38px', padding: 0 }}
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => handleRejectSeller(s.uid)}
                                                title="Quick Reject"
                                                style={{ color: 'var(--error)', width: '38px', height: '38px', padding: 0 }}
                                            >
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
        </div>
    );

    const renderProductsTable = () => (
        <div className="animate-fade-in flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h3>Product Review ({filteredProducts.length})</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                    />
                    <button className="btn btn-secondary" onClick={fetchAllData}>Refresh</button>
                </div>
            </div>
            {filteredProducts.length === 0 ? (
                <div className="glass-card text-center p-8 text-muted">No products found.</div>
            ) : (
                <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--surface)', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '1rem' }}>Product</th>
                                <th>Seller</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>{p.title}</td>
                                    <td>{p.seller}</td>
                                    <td>{p.category}</td>
                                    <td>₹{p.price}</td>
                                    <td>
                                        <span className="badge badge-success" style={{ background: 'rgba(var(--success-rgb), 0.1)', color: 'var(--success)', padding: '4px 8px', borderRadius: '4px' }}>
                                            {p.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderOrdersTable = () => (
        <div className="animate-fade-in flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h3>Global Orders ({filteredOrders.length})</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                    />
                    <button className="btn btn-secondary" onClick={fetchAllData}>Refresh</button>
                </div>
            </div>
            {filteredOrders.length === 0 ? (
                <div className="glass-card text-center p-8 text-muted">No orders found.</div>
            ) : (
                <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--surface)', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '1rem' }}>Order ID</th>
                                <th>Customer</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(o => (
                                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}><strong>{o.orderId}</strong></td>
                                    <td>{o.customer}</td>
                                    <td>₹{o.total.toLocaleString()}</td>
                                    <td>
                                        <span style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px' }}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td>{o.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    if (error) {
        return (
            <div className="container" style={{ padding: '2rem', textAlign: 'center', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--error)', marginBottom: '1rem', background: 'rgba(var(--error-rgb), 0.1)', padding: '1rem', borderRadius: '8px' }}>
                    <AlertOctagon size={48} style={{ margin: '0 auto 1rem' }} />
                    <p>{error}</p>
                </div>
                <button className="btn btn-primary" onClick={fetchAllData}>
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="flex" style={{ minHeight: 'calc(100vh - 80px)', width: '100%', gap: '2rem', padding: '2rem' }}>
            {/* Sidebar */}
            <aside className="glass-card flex flex-col justify-between" style={{ width: '280px', height: 'calc(100vh - 120px)', padding: '1.5rem', position: 'sticky', top: '2rem' }}>
                <div>
                    <div className="flex items-center gap-2" style={{ marginBottom: '2rem', color: 'var(--primary)', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                        <ShieldCheck size={28} />
                        <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Admin Panel</h3>
                    </div>
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
                        <button
                            className={`btn ${activeTab === 'sellers' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                padding: '1rem',
                                fontSize: '1rem'
                            }}
                            onClick={() => { setActiveTab('sellers'); setSearchTerm(''); }}
                        >
                            <Users size={20} /> Seller Mgmt
                        </button>
                        <button
                            className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                padding: '1rem',
                                fontSize: '1rem'
                            }}
                            onClick={() => { setActiveTab('products'); setSearchTerm(''); }}
                        >
                            <Box size={20} /> Product Review
                        </button>
                        <button
                            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                padding: '1rem',
                                fontSize: '1rem'
                            }}
                            onClick={() => { setActiveTab('orders'); setSearchTerm(''); }}
                        >
                            <ShoppingCart size={20} /> Global Orders
                        </button>
                    </nav>
                </div>

                <div style={{ marginTop: 'auto', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
                    <small className="text-muted">System Status</small>
                    <div className="flex items-center gap-2" style={{ marginTop: '0.5rem', color: 'var(--success)', fontSize: '0.9rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                        Online
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col" style={{ height: '100%', gap: '2rem' }}>
                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    <StatCard label="Total Sellers" value={stats.totalSellers} icon={<Users size={32} />} color="var(--primary)" />
                    <StatCard label="Active Products" value={stats.totalProducts} icon={<Box size={32} />} color="var(--secondary)" />
                    <StatCard label="Daily Orders" value={stats.todayOrders} icon={<ShoppingCart size={32} />} color="var(--accent)" />
                    <StatCard label="Pending Approvals" value={stats.pendingApprovals} icon={<ShieldCheck size={32} />} color="var(--warning)" />
                </div>

                {loading ? (
                    <div className="flex justify-center p-12 glass-card flex-1"><Loader className="animate-spin" /></div>
                ) : (
                    <div className="glass-card flex-1" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                            {activeTab === 'sellers' && renderSellersTable()}
                            {activeTab === 'products' && renderProductsTable()}
                            {activeTab === 'orders' && renderOrdersTable()}
                        </div>
                    </div>
                )}
            </div>
            {/* PREMIUM DATA RETRIEVAL MODAL - ORGANIZED (v2.9) */}
            {selectedSeller && (
                <div
                    className="modal-overlay flex items-center justify-center"
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 9999, padding: '2rem' }}
                    onClick={(e) => e.target === e.currentTarget && setSelectedSeller(null)}
                >
                    <div className="glass-card animate-fade-in" style={{ padding: 0, overflow: 'hidden', background: 'white', border: '1px solid var(--border)', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

                        {/* Header */}
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>Review Seller Application</h2>
                                <p className="text-muted" style={{ margin: 0 }}>UID: {selectedSeller.uid}</p>
                            </div>
                            <button
                                onClick={() => setSelectedSeller(null)}
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content Area */}
                        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>

                                {/* Left Side: Document Preview */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard size={18} className="text-primary" />
                                        <h4 style={{ margin: 0 }}>Document Proof</h4>
                                    </div>
                                    <div style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
                                        <img
                                            src={selectedSeller.aadhaarImageUrl}
                                            alt="Identity Document"
                                            style={{ width: '100%', display: 'block' }}
                                        />
                                    </div>
                                    <p className="text-xs text-center text-muted italic">Registered Aadhaar/Identity Card Preview</p>
                                </div>

                                {/* Right Side: Extracted Details */}
                                <div className="flex flex-col gap-6">

                                    {/* Personal Info Grid */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                            <User size={16} className="text-primary" />
                                            <span style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Personal Identity</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div style={{ background: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                                                <small className="text-muted mb-1 d-block">Full Name</small>
                                                <p style={{ fontWeight: 700, margin: 0 }}>{selectedSeller.extractedName || selectedSeller.name}</p>
                                            </div>
                                            <div style={{ background: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                                                <small className="text-muted mb-1 d-block">Age / Gender</small>
                                                <p style={{ fontWeight: 700, margin: 0 }}>{selectedSeller.age || 'N/A'} | {selectedSeller.gender || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Business Info Section */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                            <Store size={16} className="text-secondary" />
                                            <span style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Store Profile</span>
                                        </div>
                                        <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '10px' }}>
                                            <small className="text-muted mb-1 d-block">Store Name</small>
                                            <p style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)', margin: '0 0 0.5rem 0' }}>{selectedSeller.shopName}</p>
                                            <div className="flex flex-wrap gap-12" style={{ marginTop: '0.5rem' }}>
                                                <div style={{ minWidth: '140px' }}>
                                                    <small className="text-muted" style={{ display: 'block', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>Shop Category</small>
                                                    <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '1rem' }}>{selectedSeller.category}</span>
                                                </div>
                                                <div style={{ minWidth: '140px' }}>
                                                    <small className="text-muted" style={{ display: 'block', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em' }}>Contact Number</small>
                                                    <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '1rem' }}>{selectedSeller.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Critical Info: Address (Moved here from sidebar) */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                            <MapPin size={16} className="text-warning" />
                                            <span style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase' }}>Verification Address</span>
                                        </div>
                                        <div style={{ background: 'hsla(40, 90%, 60%, 0.05)', border: '1px dashed var(--warning)', padding: '1rem', borderRadius: '10px' }}>
                                            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, margin: 0, color: 'var(--text)' }}>
                                                {selectedSeller.address || 'Address information not extracted correctly.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer Actions - PERFECTLY SYMMETRIC */}
                        <div style={{ padding: '1.5rem 2rem', background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem', width: '100%' }}>
                            <button
                                className="btn btn-primary"
                                style={{ flex: '1 1 50%', py: '1rem', fontSize: '1rem', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                                onClick={() => { handleApproveSeller(selectedSeller.uid); setSelectedSeller(null); }}
                            >
                                <Check size={20} /> Approve Seller
                            </button>
                            <button
                                className="btn btn-secondary"
                                style={{ flex: '1 1 50%', py: '1rem', fontSize: '1rem', fontWeight: 700, color: 'var(--error)', borderColor: 'var(--error)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'white' }}
                                onClick={() => { handleRejectSeller(selectedSeller.uid); setSelectedSeller(null); }}
                            >
                                <X size={20} /> Reject Application
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
