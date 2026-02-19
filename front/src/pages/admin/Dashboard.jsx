import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Box, ShoppingCart, Truck, Check, X, AlertOctagon, Loader, Home, User, Mail, MapPin, Store, CreditCard, Calendar } from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('home');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Data states
    const [stats, setStats] = useState({ 
        totalSellers: 0, 
        totalProducts: 0, 
        todayOrders: 0, 
        pendingApprovals: 0,
        totalFeedback: 0,
        ordersToDeliver: 0,
        allSellers: 0
    });
    const [sellers, setSellers] = useState([]);
    const [allSellers, setAllSellers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState([]);
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
            if (statsData.success) {
                setStats({
                    ...statsData.stats,
                    totalFeedback: 0, // Will be updated when we fetch reviews
                    ordersToDeliver: 0, // Will be calculated from orders
                    allSellers: statsData.stats.totalSellers
                });
            }

            // Fetch pending sellers
            const sellersRes = await fetch('http://localhost:5000/admin/sellers');
            const sellersData = await sellersRes.json();
            if (sellersData.success) setSellers(sellersData.sellers);

            // Fetch all sellers (approved + pending) - with fallback
            try {
                const allSellersRes = await fetch('http://localhost:5000/admin/all-sellers');
                const allSellersData = await allSellersRes.json();
                if (allSellersData.success) {
                    setAllSellers(allSellersData.sellers);
                    setStats(prev => ({ ...prev, allSellers: allSellersData.sellers.length }));
                }
            } catch (err) {
                console.warn('Could not fetch all sellers, using pending sellers only:', err);
                setAllSellers(sellersData.sellers || []);
            }

            // Fetch products
            const productsRes = await fetch('http://localhost:5000/admin/products');
            const productsData = await productsRes.json();
            if (productsData.success) setProducts(productsData.products);

            // Fetch orders
            const ordersRes = await fetch('http://localhost:5000/admin/orders');
            const ordersData = await ordersRes.json();
            if (ordersData.success) {
                setOrders(ordersData.orders);
                // Count orders to be delivered (Processing or Shipped status)
                const toDeliver = ordersData.orders.filter(o => 
                    o.status === 'Processing' || o.status === 'Shipped'
                ).length;
                setStats(prev => ({ ...prev, ordersToDeliver: toDeliver }));
            }

            // Fetch total feedback count - with fallback
            try {
                const reviewsRes = await fetch('http://localhost:5000/admin/reviews');
                const reviewsData = await reviewsRes.json();
                if (reviewsData.success) {
                    setReviews(reviewsData.reviews);
                    setStats(prev => ({ ...prev, totalFeedback: reviewsData.reviews.length }));
                }
            } catch (err) {
                console.warn('Could not fetch reviews:', err);
                setReviews([]);
                setStats(prev => ({ ...prev, totalFeedback: 0 }));
            }
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
                alert('✅ Seller approved successfully! The seller has been notified via email.');
                setSelectedSeller(null); // Close modal if open
                fetchAllData(); // Refresh data
            } else {
                alert('❌ Failed to approve seller: ' + data.message);
            }
        } catch (err) {
            console.error('Error approving seller:', err);
            alert('❌ Error approving seller. Please try again.');
        }
    };

    const handleRejectSeller = async (uid) => {
        const confirmReject = window.confirm('Are you sure you want to reject this seller application? The seller will be notified via email.');
        if (!confirmReject) return;

        try {
            const response = await fetch(`http://localhost:5000/admin/seller/${uid}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.success) {
                alert('✅ Seller rejected. The seller has been notified via email.');
                setSelectedSeller(null); // Close modal if open
                fetchAllData(); // Refresh data
            } else {
                alert('❌ Failed to reject seller: ' + data.message);
            }
        } catch (err) {
            console.error('Error rejecting seller:', err);
            alert('❌ Error rejecting seller. Please try again.');
        }
    };

    const handleBlockSeller = async () => {
        if (!sellerToBlock) return;

        try {
            const response = await fetch(`http://localhost:5000/admin/seller/${sellerToBlock.uid}/block`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    blockDuration: blockDuration === 'permanent' ? 'permanent' : parseInt(blockDuration)
                })
            });
            const data = await response.json();
            if (data.success) {
                alert(`✅ Seller blocked successfully! The seller has been notified via email.`);
                setBlockModalOpen(false);
                setSellerToBlock(null);
                setSelectedSeller(null);
                fetchAllData();
            } else {
                alert('❌ Failed to block seller: ' + data.message);
            }
        } catch (err) {
            console.error('Error blocking seller:', err);
            alert('❌ Error blocking seller. Please try again.');
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

    const StatCardWithView = ({ label, value, icon, color, onView }) => (
        <div className="glass-card flex flex-col justify-between gap-4" style={{ minHeight: '180px' }}>
            <div className="flex justify-between items-start">
                <div style={{ padding: '0.75rem', borderRadius: '12px', background: `${color}22`, color: color }}>
                    {icon}
                </div>
            </div>
            <div>
                <h3 style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>{loading ? '-' : value}</h3>
                <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>{label}</p>
            </div>
            <button 
                className="btn btn-secondary" 
                onClick={onView}
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.9rem' }}
            >
                View
            </button>
        </div>
    );

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [blockModalOpen, setBlockModalOpen] = useState(false);
    const [sellerToBlock, setSellerToBlock] = useState(null);
    const [blockDuration, setBlockDuration] = useState('1');
    const [selectedJoinDate, setSelectedJoinDate] = useState(''); // For Seller Management date filter
    const [selectedRejectDate, setSelectedRejectDate] = useState(''); // For Rejected Applications date filter
    const [feedbackSearch, setFeedbackSearch] = useState(''); // For Consumer Feedback search
    const [selectedFeedbackDate, setSelectedFeedbackDate] = useState(''); // For Customer Feedback date filter
    const [selectedProductDate, setSelectedProductDate] = useState(''); // For Product Review date filter

    // Filter Logic
    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Render Helpers
    const renderHomeDashboard = () => (
        <div className="animate-fade-in flex flex-col gap-6">
            {/* Welcome Header */}
            <div className="glass-card" style={{ 
                padding: '2rem', 
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                color: 'white',
                borderRadius: '16px'
            }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    Welcome, Admin
                </h1>
                <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                    Manage your marketplace from this central dashboard
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <StatCardWithView 
                    label="Total Sellers" 
                    value={stats.allSellers} 
                    icon={<Users size={32} />} 
                    color="var(--primary)"
                    onView={() => setActiveTab('sellers')}
                />
                <StatCardWithView 
                    label="Active Products" 
                    value={stats.totalProducts} 
                    icon={<Box size={32} />} 
                    color="var(--secondary)"
                    onView={() => setActiveTab('products')}
                />
                <StatCardWithView 
                    label="Daily Orders" 
                    value={stats.todayOrders} 
                    icon={<ShoppingCart size={32} />} 
                    color="var(--accent)"
                    onView={() => setActiveTab('orders')}
                />
                <StatCardWithView 
                    label="Pending Approvals" 
                    value={stats.pendingApprovals} 
                    icon={<ShieldCheck size={32} />} 
                    color="var(--warning)"
                    onView={() => setActiveTab('sellers')}
                />
                <StatCardWithView 
                    label="Total Feedback" 
                    value={stats.totalFeedback} 
                    icon={<Users size={32} />} 
                    color="#10b981"
                    onView={() => setActiveTab('feedback')}
                />
                <StatCardWithView 
                    label="Orders to Deliver" 
                    value={stats.ordersToDeliver} 
                    icon={<Truck size={32} />} 
                    color="#f59e0b"
                    onView={() => setActiveTab('orders')}
                />
            </div>

            {/* Spacer */}
            <div style={{ height: '2rem' }}></div>

            {/* Quick Actions */}
            <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => setActiveTab('sellers')}
                        style={{ padding: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                    >
                        <Users size={20} /> Manage Sellers
                    </button>
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => setActiveTab('products')}
                        style={{ padding: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                    >
                        <Box size={20} /> Review Products
                    </button>
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => setActiveTab('orders')}
                        style={{ padding: '1rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                    >
                        <Truck size={20} /> View Orders
                    </button>
                </div>
            </div>
        </div>
    );

    const renderSellersTable = () => {
        // Separate sellers by status - ONLY APPROVED sellers in Seller Management
        const approvedSellers = allSellers.filter(s => s.status === 'APPROVED');
        const pendingSellers = sellers; // sellers already contains only PENDING
        const rejectedSellers = allSellers.filter(s => s.status === 'REJECTED'); // Includes blocked sellers
        
        return (
            <div className="animate-fade-in flex flex-col gap-8">
                {/* Pending Approvals Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Pending Approvals ({pendingSellers.length})</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search pending sellers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                            />
                            <button className="btn btn-secondary" onClick={fetchAllData}>Refresh</button>
                        </div>
                    </div>
                    {pendingSellers.filter(s =>
                        s.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.email.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 ? (
                        <div className="glass-card text-center p-8 text-muted">No pending approvals.</div>
                    ) : (
                        <div className="glass-card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                <thead style={{ background: 'var(--surface)', textAlign: 'left' }}>
                                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aadhaar</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Address</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Details</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingSellers.filter(s =>
                                        s.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        s.email.toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map(s => (
                                        <tr
                                            key={s.uid}
                                            style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div className="flex flex-col">
                                                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{s.extractedName || s.shopName}</span>
                                                    <span className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>Shop: {s.shopName}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{s.email}</span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.aadhaarNumber || 'N/A'}</span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span className="text-muted" style={{ fontSize: '0.85rem' }}>{s.address?.substring(0, 30)}...</span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                                <button
                                                    className="btn btn-secondary shadow-sm"
                                                    onClick={() => setSelectedSeller(s)}
                                                    style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700, borderRadius: '8px', gap: '6px' }}
                                                >
                                                    <Box size={14} /> View Full Details
                                                </button>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                                <div className="flex gap-3 justify-end">
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleApproveSeller(s.uid)}
                                                        title="Approve Seller"
                                                        style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    >
                                                        <Check size={16} /> Accept
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() => handleRejectSeller(s.uid)}
                                                        title="Reject Seller"
                                                        style={{ color: 'var(--error)', padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    >
                                                        <X size={16} /> Reject
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

                {/* Spacer between sections */}
                <div style={{ height: '3rem', borderBottom: '2px solid var(--border)' }}></div>

                {/* Seller Management Section - ONLY APPROVED SELLERS */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Seller Management ({approvedSellers.length})</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search by shop name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', width: '200px' }}
                            />
                            <select
                                value={searchCategory}
                                onChange={(e) => setSearchCategory(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', minWidth: '150px' }}
                            >
                                <option value="">All Categories</option>
                                {[...new Set(approvedSellers.map(s => s.category))].sort().map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={selectedJoinDate}
                                onChange={(e) => setSelectedJoinDate(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                                title="Filter by join date"
                            />
                            <button 
                                className="btn btn-secondary"
                                onClick={() => { setSearchTerm(''); setSearchCategory(''); setSelectedJoinDate(''); }}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                            >
                                Clear
                            </button>
                            <button 
                                className="btn btn-secondary"
                                onClick={fetchAllData}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                    
                    {approvedSellers.filter(s => {
                        // Category filter
                        const matchesCategory = searchCategory === '' || s.category === searchCategory;
                        
                        // Name search
                        const matchesName = searchTerm === '' ||
                                          s.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
                        
                        // Date filter
                        const matchesDate = selectedJoinDate === '' || s.joined === (() => {
                            const date = new Date(selectedJoinDate);
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = date.getFullYear();
                            return `${day}/${month}/${year}`;
                        })();
                        
                        return matchesCategory && matchesName && matchesDate;
                    }).length === 0 ? (
                        <div className="glass-card text-center p-8 text-muted">No approved sellers found.</div>
                    ) : (
                        <div className="glass-card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                <thead style={{ background: 'var(--surface)', textAlign: 'left' }}>
                                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shop Identity</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Info</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Verification</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {approvedSellers.filter(s => {
                                        const matchesCategory = searchCategory === '' || s.category === searchCategory;
                                        const matchesName = searchTerm === '' ||
                                                          s.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
                                        const matchesDate = selectedJoinDate === '' || s.joined === (() => {
                                            const date = new Date(selectedJoinDate);
                                            const day = String(date.getDate()).padStart(2, '0');
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const year = date.getFullYear();
                                            return `${day}/${month}/${year}`;
                                        })();
                                        return matchesCategory && matchesName && matchesDate;
                                    }).map(s => (
                                        <tr
                                            key={s.uid}
                                            style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div className="flex flex-col">
                                                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{s.shopName}</span>
                                                    <span className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>UID: {s.uid?.substring(0, 8)}</span>
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
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{ 
                                                    padding: '6px 12px', 
                                                    background: 'rgba(var(--success-rgb), 0.1)',
                                                    color: 'var(--success)',
                                                    borderRadius: '8px', 
                                                    fontSize: '0.8rem', 
                                                    fontWeight: 700 
                                                }}>
                                                    APPROVED
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span className="text-muted" style={{ fontSize: '0.85rem' }}>{s.joined}</span>
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
                                                <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Approved</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Spacer between sections */}
                <div style={{ height: '3rem', borderBottom: '2px solid var(--border)' }}></div>

                {/* Rejected Section - Shows rejected and blocked sellers */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Rejected Applications ({rejectedSellers.length})</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search rejected sellers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', width: '200px' }}
                            />
                            <input
                                type="date"
                                value={selectedRejectDate}
                                onChange={(e) => setSelectedRejectDate(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                                title="Filter by reject date"
                            />
                            <button 
                                className="btn btn-secondary"
                                onClick={() => { setSearchTerm(''); setSelectedRejectDate(''); }}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                            >
                                Clear
                            </button>
                            <button 
                                className="btn btn-secondary"
                                onClick={fetchAllData}
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                    
                    {rejectedSellers.filter(s => {
                        const matchesName = searchTerm === '' ||
                                          s.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
                        
                        const matchesDate = selectedRejectDate === '' || s.joined === (() => {
                            const date = new Date(selectedRejectDate);
                            const day = String(date.getDate()).padStart(2, '0');
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const year = date.getFullYear();
                            return `${day}/${month}/${year}`;
                        })();
                        
                        return matchesName && matchesDate;
                    }).length === 0 ? (
                        <div className="glass-card text-center p-8 text-muted">No rejected sellers.</div>
                    ) : (
                        <div className="glass-card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                                <thead style={{ background: 'var(--surface)', textAlign: 'left' }}>
                                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shop Identity</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Info</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Verification</th>
                                        <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rejectedSellers.filter(s => {
                                        const matchesName = searchTerm === '' ||
                                                          s.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
                                        const matchesDate = selectedRejectDate === '' || s.joined === (() => {
                                            const date = new Date(selectedRejectDate);
                                            const day = String(date.getDate()).padStart(2, '0');
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const year = date.getFullYear();
                                            return `${day}/${month}/${year}`;
                                        })();
                                        return matchesName && matchesDate;
                                    }).map(s => (
                                        <tr
                                            key={s.uid}
                                            style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div className="flex flex-col">
                                                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{s.shopName}</span>
                                                    <span className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>UID: {s.uid?.substring(0, 8)}</span>
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
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div className="flex flex-col gap-1">
                                                    <span style={{ 
                                                        padding: '6px 12px', 
                                                        background: 'rgba(var(--error-rgb), 0.1)',
                                                        color: 'var(--error)',
                                                        borderRadius: '8px', 
                                                        fontSize: '0.8rem', 
                                                        fontWeight: 700 
                                                    }}>
                                                        REJECTED
                                                    </span>
                                                    {s.isBlocked && (
                                                        <span style={{ 
                                                            padding: '4px 8px', 
                                                            background: 'rgba(255, 152, 0, 0.1)',
                                                            color: '#ff9800',
                                                            borderRadius: '6px', 
                                                            fontSize: '0.7rem', 
                                                            fontWeight: 700,
                                                            textAlign: 'center'
                                                        }}>
                                                            🚫 BLOCKED
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span className="text-muted" style={{ fontSize: '0.85rem' }}>{s.joined}</span>
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
                                                <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                                    {s.isBlocked ? 'Blocked' : 'Rejected'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderProductsTable = () => {
        // Filter products by search term, category, and date
        const filteredProductsList = products.filter(p => {
            const matchesSearch = searchTerm === '' ||
                p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.category.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesDate = selectedProductDate === '' || p.date === (() => {
                const date = new Date(selectedProductDate);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            })();
            
            return matchesSearch && matchesDate;
        });

        return (
            <div className="animate-fade-in flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Product Review ({filteredProductsList.length})</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', width: '200px' }}
                        />
                        <input
                            type="date"
                            value={selectedProductDate}
                            onChange={(e) => setSelectedProductDate(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                            title="Filter by product date (dd/mm/yyyy)"
                        />
                        <button 
                            className="btn btn-secondary"
                            onClick={() => { setSearchTerm(''); setSelectedProductDate(''); }}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                            Clear
                        </button>
                        <button 
                            className="btn btn-secondary" 
                            onClick={fetchAllData}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                            Refresh
                        </button>
                    </div>
                </div>
                {filteredProductsList.length === 0 ? (
                    <div className="glass-card text-center p-8 text-muted">
                        {searchTerm || selectedProductDate ? 'No products found matching your search criteria.' : 'No products found.'}
                    </div>
                ) : (
                    <div className="glass-card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead style={{ background: 'var(--surface)', textAlign: 'left' }}>
                                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seller</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Discounted Price</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProductsList.map(p => {
                                    const hasDiscount = p.discountedPrice && p.discountedPrice < p.price;
                                    const isOutOfStock = p.stock === 0;
                                    const displayStatus = isOutOfStock ? 'Inactive' : (p.status || 'Active');
                                    
                                    return (
                                        <tr 
                                            key={p.id} 
                                            style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{ fontWeight: 600, fontSize: '1rem' }}>{p.title}</span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{ fontSize: '0.9rem' }}>{p.seller}</span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{ fontSize: '0.9rem' }}>{p.category}</span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span className="text-muted" style={{ fontSize: '0.85rem' }}>{p.date}</span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>₹{p.price}</span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                {hasDiscount ? (
                                                    <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1rem' }}>
                                                        ₹{p.discountedPrice}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span 
                                                    style={{ 
                                                        background: displayStatus === 'Active' ? 'rgba(var(--success-rgb), 0.1)' : 'rgba(128, 128, 128, 0.1)', 
                                                        color: displayStatus === 'Active' ? 'var(--success)' : '#666', 
                                                        padding: '6px 12px', 
                                                        borderRadius: '6px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 700
                                                    }}
                                                >
                                                    {displayStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    const renderOrdersTable = () => {
        // Helper function to convert dd/mm/yyyy to Date object for sorting
        const parseDate = (dateString) => {
            const [day, month, year] = dateString.split('/');
            return new Date(year, month - 1, day);
        };

        // Sort orders by date (descending - latest first)
        const sortedOrders = [...orders].sort((a, b) => {
            return parseDate(b.date) - parseDate(a.date);
        });

        // Filter orders by search term (Order ID or Customer Name) and selected date
        const filteredOrdersList = sortedOrders.filter(o => {
            const matchesSearch = searchTerm === '' || 
                o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.customer.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesDate = selectedDate === '' || o.date === (() => {
                const date = new Date(selectedDate);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            })();
            
            return matchesSearch && matchesDate;
        });

        return (
            <div className="animate-fade-in flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Global Orders ({filteredOrdersList.length})</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search by Order ID or Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', width: '250px' }}
                        />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                            title="Filter by date"
                        />
                        {(searchTerm || selectedDate) && (
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => { setSearchTerm(''); setSelectedDate(''); }}
                                style={{ padding: '0.5rem 1rem' }}
                            >
                                Clear
                            </button>
                        )}
                        <button 
                            className="btn btn-secondary" 
                            onClick={() => { 
                                setSearchTerm(''); 
                                setSelectedDate(''); 
                                fetchAllData(); 
                            }}
                        >
                            Refresh
                        </button>
                    </div>
                </div>
                {filteredOrdersList.length === 0 ? (
                    <div className="glass-card text-center p-8 text-muted">
                        {searchTerm || selectedDate ? 'No orders found matching your search criteria.' : 'No orders found.'}
                    </div>
                ) : (
                    <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: 'var(--surface)', textAlign: 'left' }}>
                                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrdersList.map(o => {
                                    // Normalize status - convert "Placed" to "Order Placed"
                                    const normalizedStatus = o.status === 'Placed' ? 'Order Placed' : o.status;
                                    
                                    return (
                                        <tr 
                                            key={o.id} 
                                            style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <strong style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{o.orderId}</strong>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{ fontWeight: 500 }}>{o.customer}</span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>₹{o.total.toLocaleString()}</span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{ 
                                                    background: normalizedStatus === 'Delivered' ? 'rgba(var(--success-rgb), 0.1)' : 
                                                               normalizedStatus === 'Processing' ? 'rgba(var(--primary-rgb), 0.1)' : 
                                                               normalizedStatus === 'Shipped' ? 'rgba(var(--accent-rgb), 0.1)' : 
                                                               'rgba(var(--warning-rgb), 0.1)', 
                                                    color: normalizedStatus === 'Delivered' ? 'var(--success)' : 
                                                           normalizedStatus === 'Processing' ? 'var(--primary)' : 
                                                           normalizedStatus === 'Shipped' ? 'var(--accent)' : 
                                                           'var(--warning)', 
                                                    padding: '6px 12px', 
                                                    borderRadius: '6px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700
                                                }}>
                                                    {normalizedStatus}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{ fontSize: '0.9rem' }}>{o.date}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    const handleDeleteReview = async (reviewId) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this review? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:5000/admin/review/${reviewId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (data.success) {
                alert('✅ Review deleted successfully!');
                fetchAllData(); // Refresh data
            } else {
                alert('❌ Failed to delete review: ' + data.message);
            }
        } catch (err) {
            console.error('Error deleting review:', err);
            alert('❌ Error deleting review. Please try again.');
        }
    };

    const renderFeedbackTable = () => {
        const filteredReviews = reviews.filter(r => {
            const matchesSearch = feedbackSearch === '' ||
                r.productName.toLowerCase().includes(feedbackSearch.toLowerCase()) ||
                r.customerName.toLowerCase().includes(feedbackSearch.toLowerCase());
            
            const matchesDate = selectedFeedbackDate === '' || r.date === (() => {
                const date = new Date(selectedFeedbackDate);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            })();
            
            return matchesSearch && matchesDate;
        });

        return (
            <div className="animate-fade-in flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Customer Feedback ({reviews.length})</h3>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search by product or customer..."
                            value={feedbackSearch}
                            onChange={(e) => setFeedbackSearch(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', width: '250px' }}
                        />
                        <input
                            type="date"
                            value={selectedFeedbackDate}
                            onChange={(e) => setSelectedFeedbackDate(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                            title="Filter by review date (dd/mm/yyyy)"
                        />
                        <button 
                            className="btn btn-secondary"
                            onClick={() => { setFeedbackSearch(''); setSelectedFeedbackDate(''); }}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                            Clear
                        </button>
                        <button 
                            className="btn btn-secondary"
                            onClick={fetchAllData}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                            Refresh
                        </button>
                    </div>
                </div>
                
                {filteredReviews.length === 0 ? (
                    <div className="glass-card text-center p-8 text-muted">
                        {feedbackSearch ? 'No feedback found matching your search.' : 'No customer feedback yet.'}
                    </div>
                ) : (
                    <div className="glass-card" style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                            <thead style={{ background: 'var(--surface)', textAlign: 'left' }}>
                                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Details</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Review</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReviews.map(r => (
                                    <tr
                                        key={r.id}
                                        style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div className="flex flex-col gap-1">
                                                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{r.productName}</span>
                                                <div className="flex gap-3" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    <span>Category: <strong>{r.productCategory}</strong></span>
                                                    <span>Brand: <strong>{r.productBrand}</strong></span>
                                                </div>
                                                <div className="flex items-center gap-2" style={{ marginTop: '4px' }}>
                                                    <div style={{ display: 'flex', gap: '1px' }}>
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} style={{ color: i < Math.round(r.productAvgRating) ? '#fbbf24' : '#d1d5db', fontSize: '0.9rem' }}>
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                                        {r.productAvgRating.toFixed(1)} ({r.productReviewCount} reviews)
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div className="flex flex-col">
                                                <span style={{ fontWeight: 600 }}>{r.customerName}</span>
                                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>ID: {r.customerId?.substring(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ display: 'flex', gap: '2px' }}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} style={{ color: i < r.rating ? '#fbbf24' : '#d1d5db', fontSize: '1.2rem' }}>
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: r.rating >= 4 ? 'var(--success)' : r.rating >= 3 ? 'var(--warning)' : 'var(--error)' }}>
                                                    {r.rating}/5
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', maxWidth: '350px' }}>
                                            <span className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                                                {r.feedback.length > 120 ? r.feedback.substring(0, 120) + '...' : r.feedback}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <span className="text-muted" style={{ fontSize: '0.85rem' }}>{r.date}</span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={() => handleDeleteReview(r.id)}
                                                title="Delete Review"
                                                style={{ 
                                                    padding: '6px 12px', 
                                                    fontSize: '0.8rem', 
                                                    fontWeight: 700, 
                                                    color: 'var(--error)', 
                                                    borderColor: 'var(--error)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}
                                            >
                                                <X size={14} /> Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

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
                        <button
                            className={`btn ${activeTab === 'home' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                padding: '1rem',
                                fontSize: '1rem'
                            }}
                            onClick={() => { setActiveTab('home'); setSearchTerm(''); }}
                        >
                            <Home size={20} /> Home
                        </button>
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
                            <Truck size={20} /> Global Orders
                        </button>
                        <button
                            className={`btn ${activeTab === 'feedback' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{
                                width: '100%',
                                justifyContent: 'flex-start',
                                padding: '1rem',
                                fontSize: '1rem'
                            }}
                            onClick={() => { setActiveTab('feedback'); setSearchTerm(''); }}
                        >
                            <Mail size={20} /> Customer Feedback
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
                {loading ? (
                    <div className="flex justify-center p-12 glass-card flex-1"><Loader className="animate-spin" /></div>
                ) : (
                    <div className="glass-card flex-1" style={{ padding: activeTab === 'home' ? '2rem' : '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: activeTab === 'home' ? '0' : '1.5rem', borderBottom: activeTab === 'home' ? 'none' : '1px solid var(--border)' }}>
                            {activeTab === 'home' && renderHomeDashboard()}
                            {activeTab === 'sellers' && renderSellersTable()}
                            {activeTab === 'products' && renderProductsTable()}
                            {activeTab === 'orders' && renderOrdersTable()}
                            {activeTab === 'feedback' && renderFeedbackTable()}
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
                                                <small className="text-muted mb-1 d-block">UIDAI Number</small>
                                                <p style={{ fontWeight: 700, margin: 0, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{selectedSeller.aadhaarNumber || 'Not Extracted'}</p>
                                            </div>
                                            <div style={{ background: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: '10px', gridColumn: 'span 2' }}>
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

                        {/* Sticky Footer Actions */}
                        <div style={{ padding: '1.5rem 2rem', background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', gap: '1rem', width: '100%' }}>
                            {selectedSeller.status === 'PENDING' ? (
                                <>
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
                                </>
                            ) : selectedSeller.status === 'APPROVED' ? (
                                <button
                                    className="btn btn-secondary"
                                    style={{ flex: '1 1 100%', py: '1rem', fontSize: '1rem', fontWeight: 700, color: 'var(--error)', borderColor: 'var(--error)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'white' }}
                                    onClick={() => { setSellerToBlock(selectedSeller); setBlockModalOpen(true); }}
                                >
                                    <X size={20} /> Block Seller
                                </button>
                            ) : (
                                <button
                                    className="btn btn-secondary"
                                    style={{ flex: '1 1 100%', py: '1rem', fontSize: '1rem', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                                    onClick={() => setSelectedSeller(null)}
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Block Seller Modal */}
            {blockModalOpen && sellerToBlock && (
                <div
                    className="modal-overlay flex items-center justify-center"
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 10000, padding: '2rem' }}
                    onClick={(e) => e.target === e.currentTarget && setBlockModalOpen(false)}
                >
                    <div className="glass-card animate-fade-in" style={{ padding: '2rem', background: 'white', border: '1px solid var(--border)', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '500px' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>Block Seller</h2>
                            <p className="text-muted">Block {sellerToBlock.shopName} for a specified duration</p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Block Duration</label>
                            <select
                                value={blockDuration}
                                onChange={(e) => setBlockDuration(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem' }}
                            >
                                <option value="1">1 Day</option>
                                <option value="3">3 Days</option>
                                <option value="5">5 Days</option>
                                <option value="7">7 Days</option>
                                <option value="14">14 Days</option>
                                <option value="30">30 Days</option>
                                <option value="custom">Custom Days</option>
                                <option value="permanent">Permanent Block</option>
                            </select>
                        </div>

                        {blockDuration === 'custom' && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Number of Days</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={blockDuration === 'custom' ? '' : blockDuration}
                                    onChange={(e) => setBlockDuration(e.target.value)}
                                    placeholder="Enter number of days"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '1rem' }}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => { setBlockModalOpen(false); setSellerToBlock(null); }}
                                style={{ flex: 1, padding: '0.75rem' }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleBlockSeller}
                                style={{ flex: 1, padding: '0.75rem', background: 'var(--error)', borderColor: 'var(--error)' }}
                            >
                                Block Seller
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
