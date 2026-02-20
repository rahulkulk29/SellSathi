import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Box, ShoppingCart, Truck, Check, X, AlertOctagon, Loader, Home, Mail } from 'lucide-react';
import { authFetch } from '../../utils/api';
=======
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, Users, Box, ShoppingCart,
    Truck, Check, X, AlertOctagon, Loader,
    Search, RefreshCw, ChevronRight, Filter,
    TrendingUp, Ban, CheckCircle2, LayoutDashboard,
    Download, Eye, ShieldAlert, ShieldBan, Info
} from 'lucide-react';
import { auth } from '../../config/firebase';
>>>>>>> lokesh

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('home');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

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

<<<<<<< HEAD
            // Fetch stats
            const statsRes = await authFetch('/admin/stats');
            if (!statsRes.ok) {
                const errText = await statsRes.text();
                throw new Error(`Admin stats failed (${statsRes.status}): ${errText}`);
            }
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
            const sellersRes = await authFetch('/admin/sellers');
            if (!sellersRes.ok) {
                const errText = await sellersRes.text();
                throw new Error(`Admin sellers failed (${sellersRes.status}): ${errText}`);
            }
            const sellersData = await sellersRes.json();
            if (sellersData.success) setSellers(sellersData.sellers);

            // Fetch all sellers (approved + pending) - with fallback
            try {
                const allSellersRes = await authFetch('/admin/all-sellers');
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
            const productsRes = await authFetch('/admin/products');
            if (!productsRes.ok) {
                const errText = await productsRes.text();
                throw new Error(`Admin products failed (${productsRes.status}): ${errText}`);
            }
            const productsData = await productsRes.json();
            if (productsData.success) setProducts(productsData.products);

            // Fetch orders
            const ordersRes = await authFetch('/admin/orders');
            if (!ordersRes.ok) {
                const errText = await ordersRes.text();
                throw new Error(`Admin orders failed (${ordersRes.status}): ${errText}`);
            }
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
                const reviewsRes = await authFetch('/admin/reviews');
                if (!reviewsRes.ok) {
                    const errText = await reviewsRes.text();
                    throw new Error(`Admin reviews failed (${reviewsRes.status}): ${errText}`);
                }
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
            setError(err?.message || 'Failed to load dashboard data. Please refresh.');
=======
            if (statsData.success) setStats(statsData.stats);
            if (sellersData.success) setSellers(sellersData.sellers);
            if (productsData.success) setProducts(productsData.products);
            if (ordersData.success) setOrders(ordersData.orders);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load dashboard data. Please check your backend connection.');
>>>>>>> lokesh
        } finally {
            setLoading(false);
        }
    };

    const handleApproveSeller = async (uid) => {
        try {
            const response = await authFetch(`/admin/seller/${uid}/approve`, {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
<<<<<<< HEAD
                alert('✅ Seller approved successfully! The seller has been notified via email.');
                setSelectedSeller(null); // Close modal if open
                fetchAllData(); // Refresh data
            } else {
                alert('❌ Failed to approve seller: ' + data.message);
            }
        } catch (err) {
            console.error('Error approving seller:', err);
            alert('❌ Error approving seller. Please try again.');
=======
                fetchAllData();
            }
        } catch (err) {
            console.error('Error approving seller:', err);
>>>>>>> lokesh
        }
    };

    const handleRejectSeller = async (uid) => {
        const confirmReject = window.confirm('Are you sure you want to reject this seller application? The seller will be notified via email.');
        if (!confirmReject) return;

        try {
            const response = await authFetch(`/admin/seller/${uid}/reject`, {
                method: 'POST'
            });
            const data = await response.json();
            if (data.success) {
<<<<<<< HEAD
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
            const response = await authFetch(`/admin/seller/${sellerToBlock.uid}/block`, {
                method: 'POST',
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
=======
                fetchAllData();
            }
        } catch (err) {
            console.error('Error rejecting seller:', err);
>>>>>>> lokesh
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

<<<<<<< HEAD
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
=======
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
>>>>>>> lokesh
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

<<<<<<< HEAD
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
            const response = await authFetch(`/admin/review/${reviewId}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                alert('Review deleted successfully');
                fetchAllData();
            } else {
                alert('Failed to delete review');
            }
        } catch (err) {
            console.error('Error deleting review:', err);
            alert('Error deleting review. Please try again.');
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
=======
    const filteredOrders = orders.filter(o =>
        o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const navItems = [
        { id: 'sellers', label: 'Sellers', icon: Users, count: sellers.length },
        { id: 'products', label: 'Products', icon: Box, count: products.length },
        { id: 'orders', label: 'Orders', icon: ShoppingCart, count: orders.length }
    ];
>>>>>>> lokesh

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
<<<<<<< HEAD
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
=======
                    <div>
                        <h2 className="text-xl font-black text-gray-900 leading-none">Admin</h2>
                        <p className="text-[10px] font-black tracking-widest text-primary uppercase mt-1">Sellsathi Hub</p>
                    </div>
>>>>>>> lokesh
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
<<<<<<< HEAD
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
=======
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
>>>>>>> lokesh
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
<<<<<<< HEAD
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
=======
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
>>>>>>> lokesh
        </div>
    );
}
