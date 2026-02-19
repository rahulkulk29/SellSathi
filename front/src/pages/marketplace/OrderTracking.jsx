import { motion } from 'framer-motion';
import { Package, Truck, Box, CheckCircle } from 'lucide-react';

export default function OrderTracking() {
    const steps = [
        { title: 'Order Placed', date: '2026-02-10 09:30 AM', status: 'completed', icon: <Package /> },
        { title: 'Packed', date: '2026-02-10 11:45 AM', status: 'completed', icon: <Box /> },
        { title: 'In Transit', date: 'Processing...', status: 'active', icon: <Truck /> },
        { title: 'Delivered', date: '-', status: 'pending', icon: <CheckCircle /> },
    ];

    return (
        <div className="container animate-fade-in" style={{ padding: '4rem 0', maxWidth: '800px' }}>
            <div className="glass-card" style={{ padding: '3rem' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem' }}>Track Order: #ORD-5521</h1>
                        <p className="text-muted">Estimated Delivery: Feb 12, 2026</p>
                    </div>
                    <span className="btn btn-secondary">Download Invoice</span>
                </div>

                <div className="flex flex-col gap-0" style={{ position: 'relative' }}>
                    {steps.map((s, i) => (
                        <div key={i} className="flex gap-6" style={{ minHeight: '100px' }}>
                            <div className="flex flex-col items-center">
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: s.status === 'completed' ? 'var(--success)' : s.status === 'active' ? 'var(--primary)' : 'var(--surface)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 2
                                }}>
                                    {s.icon}
                                </div>
                                {i !== steps.length - 1 && (
                                    <div style={{
                                        flex: 1,
                                        width: '2px',
                                        background: s.status === 'completed' ? 'var(--success)' : 'var(--border)',
                                        margin: i === 1 ? '0' : '0.5rem 0',
                                        zIndex: 1
                                    }}></div>
                                )}
                            </div>

                            <div style={{ paddingBottom: '2rem' }}>
                                <h4 style={{ color: s.status === 'pending' ? 'var(--text-muted)' : 'white' }}>{s.title}</h4>
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>{s.date}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="glass-card" style={{ marginTop: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <img
                        src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"
                        style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                    <div className="flex-1">
                        <h4>Aero-X Wireless Earbuds</h4>
                        <p className="text-muted">Seller: TechWorld</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h4>₹129.00</h4>
                        <p className="text-muted">Qty: 1</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
