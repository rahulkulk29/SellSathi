import { motion } from 'framer-motion';
import { ArrowLeft, Download, Mail, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OrderTracking() {
    const navigate = useNavigate();



    return (
        <div className="container animate-fade-in" style={{ padding: '4rem 0', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Action Bar - Non-printable */}
            <div className="no-print flex justify-between items-center" style={{ width: '100%', maxWidth: '850px', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/checkout')}
                    className="btn btn-secondary flex items-center gap-2"
                    style={{ padding: '0.6rem 1.2rem' }}
                >
                    <ArrowLeft size={18} />
                    Back to Checkout
                </button>

            </div>

            {/* Professional Invoice Card */}
            <div id="invoice-card" className="invoice-container" style={{
                background: 'white',
                width: '100%',
                maxWidth: '850px',
                padding: '3rem',
                borderRadius: '8px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                color: '#1a1a1a',
                position: 'relative',
                fontFamily: "'Inter', sans-serif"
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '3rem', fontWeight: '800', margin: 0, letterSpacing: '-2px', color: '#000' }}>INVOICE</h1>
                        <p style={{ color: '#666', fontSize: '1.1rem', marginTop: '0.5rem' }}>#AB2324-01</p>
                    </div>
                    {/* Logo Placeholder - Matches the abstract shape in design */}
                    <div style={{
                        width: '45px',
                        height: '45px',
                        background: '#1a1a1a',
                        borderRadius: '12px',
                        transform: 'rotate(-15deg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{ width: '20px', height: '20px', border: '3px solid white', borderRadius: '4px' }}></div>
                    </div>
                </div>

                {/* Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ color: '#999', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Issued</label>
                            <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>13 Feb, 2026</p>
                        </div>
                        <div>
                            <label style={{ color: '#999', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Due</label>
                            <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>15 Feb, 2026</p>
                        </div>
                    </div>
                    <div>
                        <label style={{ color: '#999', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>From</label>
                        <p style={{ fontWeight: '700', fontSize: '1.2rem', marginBottom: '0.4rem' }}>SELLSATHI Marketplace</p>
                        <p style={{ color: '#555', lineHeight: '1.6', fontSize: '0.95rem' }}>
                            Business address<br />
                            City, State, IN — 000 000<br />
                            TAX ID 0000001234XXXXX
                        </p>
                    </div>
                </div>

                {/* Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee' }}>
                            <th style={{ textAlign: 'left', padding: '1rem 0', color: '#666', fontWeight: '500', fontSize: '0.9rem' }}>Service</th>
                            <th style={{ textAlign: 'center', padding: '1rem 0', color: '#666', fontWeight: '500', fontSize: '0.9rem' }}>Qty</th>
                            <th style={{ textAlign: 'right', padding: '1rem 0', color: '#666', fontWeight: '500', fontSize: '0.9rem' }}>Rate</th>
                            <th style={{ textAlign: 'right', padding: '1rem 0', color: '#666', fontWeight: '500', fontSize: '0.9rem' }}>Line total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #f9f9f9' }}>
                            <td style={{ padding: '1rem 0', fontWeight: '500' }}>Aero-X Wireless Earbuds</td>
                            <td style={{ textAlign: 'center', padding: '1rem 0' }}>1</td>
                            <td style={{ textAlign: 'right', padding: '1rem 0' }}>₹129.00</td>
                            <td style={{ textAlign: 'right', padding: '1rem 0', fontWeight: '600' }}>₹129.00</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #f9f9f9' }}>
                            <td style={{ padding: '1rem 0', fontWeight: '500' }}>Shipping & Handling</td>
                            <td style={{ textAlign: 'center', padding: '1rem 0' }}>1</td>
                            <td style={{ textAlign: 'right', padding: '1rem 0' }}>₹0.00</td>
                            <td style={{ textAlign: 'right', padding: '1rem 0', fontWeight: '600' }}>₹0.00</td>
                        </tr>
                    </tbody>
                </table>

                {/* Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '280px' }}>
                        <span style={{ color: '#666' }}>Subtotal</span>
                        <span style={{ fontWeight: '600' }}>₹129.00</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '280px' }}>
                        <span style={{ color: '#666' }}>Tax (0%)</span>
                        <span style={{ fontWeight: '600' }}>₹0.00</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '280px', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #000', fontSize: '1.4rem', fontWeight: '900' }}>
                        <span>Total</span>
                        <span>₹129.00</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '280px', marginTop: '0.5rem' }}>
                        <span style={{ color: '#666', fontSize: '0.9rem' }}>Amount due</span>
                        <span style={{ fontWeight: '700', fontSize: '1rem' }}>INR ₹129.00</span>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '4rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
                    <p style={{ fontWeight: '700', marginBottom: '0.4rem' }}>Thank you for the business!</p>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Please pay within 15 days of receiving this invoice.</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem' }}>
                        <p style={{ fontWeight: '600', color: '#000' }}>Digital Product Designer, IN</p>
                        <div style={{ display: 'flex', gap: '2rem', color: '#666', fontSize: '0.9rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> +91 00000 00000</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} /> hello@sellsathi.com</span>
                        </div>
                    </div>
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
