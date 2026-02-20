import { motion } from 'framer-motion';
import { ArrowLeft, Download, Mail, Phone, MapPin, Loader, Package } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function OrderTracking() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            return;
        }

        const fetchOrderDetails = async () => {
            try {
                // We'll use the user orders endpoint or a specific order endpoint
                // Since we don't have a specific order GET, we'll assume we can fetch it if we had the uid, 
                // but let's check if we can add a simple GET /api/order/:id
                const res = await fetch(`http://localhost:5000/api/orders/${orderId}`);
                const data = await res.json();
                if (data.success) {
                    setOrder(data.order);
                }
            } catch (err) {
                console.error("Fetch Order Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!order && orderId) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <Package size={64} className="text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
                <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Back to Dashboard</button>
            </div>
        );
    }

    // Default static data if no orderId (for demo)
    const displayOrder = order || {
        orderId: 'AB2324-01',
        createdAt: new Date(),
        items: [{ name: 'Aero-X Wireless Earbuds', quantity: 1, price: 129 }],
        total: 129,
        customerName: 'Sellsathi Member'
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '4rem 0', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Action Bar - Non-printable */}
            <div className="no-print flex flex-wrap justify-between items-center gap-4" style={{ width: '100%', maxWidth: '850px', marginBottom: '2.5rem' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-gray-600 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:text-primary transition-all font-bold text-sm"
                >
                    <ArrowLeft size={18} />
                    Return to Dashboard
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.open(`http://localhost:5000/api/invoice/${orderId}`, '_blank')}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-2xl border border-primary/10 shadow-sm hover:shadow-md hover:bg-primary/5 transition-all font-bold text-sm"
                    >
                        <Download size={18} />
                        Download PDF
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-105 active:scale-95 transition-all font-bold text-sm"
                    >
                        <Package size={18} />
                        Print Invoice
                    </button>
                </div>
            </div>

            {/* Professional Invoice Card */}
            <div id="invoice-card" className="invoice-container shadow-2xl" style={{
                background: 'white',
                width: '100%',
                maxWidth: '850px',
                padding: '4rem',
                borderRadius: '2rem',
                color: '#1a1a1a',
                position: 'relative',
                fontFamily: "'Inter', sans-serif",
                border: '1px solid #f0f0f0'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', margin: 0, letterSpacing: '-3px', color: '#000', lineHeight: 0.8 }}>INVOICE</h1>
                        <p style={{ color: '#999', fontSize: '1.1rem', marginTop: '1.5rem', fontWeight: 700, fontBuffer: 'mono' }}>
                            #{displayOrder.orderId || displayOrder.id?.substring(0, 8)}
                        </p>
                    </div>
                    <div className="bg-primary p-4 rounded-3xl rotate-12 shadow-lg shadow-primary/20">
                        <Package size={32} className="text-white" />
                    </div>
                </div>

                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem', paddingBottom: '3rem', borderBottom: '2px solid #f8f8f8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ color: '#bbb', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', letterSpacing: '1px' }}>Date Issued</label>
                            <p style={{ fontWeight: '800', fontSize: '1.2rem' }}>
                                {new Date(displayOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <div>
                            <label style={{ color: '#bbb', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', letterSpacing: '1px' }}>Bill To</label>
                            <p style={{ fontWeight: '800', fontSize: '1.2rem' }}>{displayOrder.customerName || 'Customer'}</p>
                        </div>
                    </div>
                    <div>
                        <label style={{ color: '#bbb', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', letterSpacing: '1px' }}>From</label>
                        <p style={{ fontWeight: '900', fontSize: '1.3rem', marginBottom: '0.5rem' }}>SELLSATHI</p>
                        <p style={{ color: '#777', lineHeight: '1.6', fontSize: '0.95rem', fontWeight: 500 }}>
                            Premium Marketplace Hub<br />
                            contact@sellsathi.com<br />
                            New Delhi, India
                        </p>
                    </div>
                </div>

                {/* Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #000' }}>
                            <th style={{ textAlign: 'left', padding: '1.5rem 0', color: '#000', fontWeight: '900', fontSize: '0.85rem', textTransform: 'uppercase' }}>Item Description</th>
                            <th style={{ textAlign: 'center', padding: '1.5rem 0', color: '#000', fontWeight: '900', fontSize: '0.85rem', textTransform: 'uppercase' }}>Qty</th>
                            <th style={{ textAlign: 'right', padding: '1.5rem 0', color: '#000', fontWeight: '900', fontSize: '0.85rem', textTransform: 'uppercase' }}>Price</th>
                            <th style={{ textAlign: 'right', padding: '1.5rem 0', color: '#000', fontWeight: '900', fontSize: '0.85rem', textTransform: 'uppercase' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody style={{ borderBottom: '2px solid #000' }}>
                        {(displayOrder.items || []).map((item, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '1.5rem 0', fontWeight: '700', fontSize: '1.1rem' }}>{item.name || item.title}</td>
                                <td style={{ textAlign: 'center', padding: '1.5rem 0', fontWeight: '700' }}>{item.quantity}</td>
                                <td style={{ textAlign: 'right', padding: '1.5rem 0', fontWeight: '700' }}>₹{item.price.toLocaleString('en-IN')}</td>
                                <td style={{ textAlign: 'right', padding: '1.5rem 0', fontWeight: '900' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1.2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '320px' }}>
                        <span style={{ color: '#777', fontWeight: 700 }}>Subtotal</span>
                        <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>₹{displayOrder.total?.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '320px', borderTop: '3px solid #000', marginTop: '1rem', paddingTop: '1.5rem' }}>
                        <span style={{ fontWeight: '900', fontSize: '1.4rem' }}>TOTAL</span>
                        <span style={{ fontWeight: '900', fontSize: '1.8rem', color: '#000' }}>₹{displayOrder.total?.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '5rem', paddingTop: '2rem', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
                    <p style={{ fontWeight: '900', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Thank you for shopping with Sellsathi!</p>
                    <p style={{ color: '#999', fontSize: '0.9rem', fontWeight: 600 }}>This is a computer generated invoice and does not require a physical signature.</p>
                </div>
            </div>

            <style>
                {`
                    @media print {
                        .no-print { display: none !important; }
                        body { background: white !important; padding: 0 !important; }
                        .container { padding: 0 !important; max-width: 100% !important; }
                        #invoice-card { 
                            box-shadow: none !important; 
                            padding: 0 !important; 
                            width: 100% !important;
                            max-width: 100% !important;
                        }
                    }
                    .invoice-container {
                        transition: all 0.3s ease;
                    }
                `}
            </style>
        </div>
    );
}
