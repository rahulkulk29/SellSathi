import { useParams, Link } from 'react-router-dom';
import { PRODUCTS } from '../../utils/mockData';
import { ShoppingCart, Heart, Shield, Truck, RotateCcw, ArrowLeft, Star, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductDetail() {
    const { id } = useParams();
    const product = PRODUCTS.find(p => p.id === parseInt(id)) || PRODUCTS[0];

    return (
        <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', background: 'var(--background)' }}>
            {/* Nav Header */}
            <div className="flex justify-between items-center" style={{ marginBottom: '3rem' }}>
                <Link to="/" className="btn btn-secondary" style={{ borderRadius: '999px', padding: '0.6rem 1.25rem' }}>
                    <ArrowLeft size={18} /> <span style={{ fontWeight: 700 }}>Back to Explore</span>
                </Link>
                <button className="btn btn-secondary" style={{ borderRadius: '50%', width: '44px', height: '44px', padding: 0 }}>
                    <Share2 size={18} />
                </button>
            </div>

            <div className="responsive-layout" style={{ gap: '4rem' }}>
                {/* Images Section */}
                <div style={{ flex: 1.2 }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card" 
                        style={{ padding: 0, border: 'none', overflow: 'hidden', height: '600px', borderRadius: '2rem', boxShadow: 'var(--shadow-premium)' }}
                    >
                        <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </motion.div>
                    
                    {/* Thumbnails */}
                    <div className="flex gap-4 overflow-x-auto" style={{ marginTop: '1.5rem', paddingBottom: '0.5rem' }}>
                        {[...Array(4)].map((_, i) => (
                            <motion.div 
                                key={i} 
                                whileHover={{ y: -5 }}
                                className="glass-card" 
                                style={{ 
                                    padding: 0, 
                                    overflow: 'hidden', 
                                    minWidth: '100px', 
                                    height: '100px', 
                                    cursor: 'pointer', 
                                    borderRadius: '1.25rem', 
                                    border: i === 0 ? '2px solid var(--primary)' : 'none',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            >
                                <img src={product.image} alt={`thumbnail ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: i === 0 ? 1 : 0.6 }} />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Info Section */}
                <div style={{ flex: 1 }} className="flex flex-col gap-8">
                    <div>
                        <div className="flex items-center gap-3" style={{ marginBottom: '1.5rem' }}>
                            <span style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 900, 
                                padding: '6px 14px', 
                                background: 'var(--primary-soft)', 
                                color: 'var(--primary)', 
                                borderRadius: '999px', 
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                {product.category}
                            </span>
                            <div className="flex items-center gap-1" style={{ color: '#fbbf24' }}>
                                <Star size={16} fill="currentColor" />
                                <span style={{ color: 'var(--text)', fontWeight: 800, fontSize: '0.9rem' }}>4.8 (120 reviews)</span>
                            </div>
                        </div>

                        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.1, fontWeight: '900', letterSpacing: '-0.04em', margin: '0 0 1rem 0' }}>{product.title}</h1>
                        <p className="text-muted" style={{ fontSize: '1.25rem' }}>Curated by <span style={{ color: 'var(--text)', fontWeight: '800' }}>{product.seller}</span></p>
                    </div>

                    <div style={{ padding: '2rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                        <div className="flex items-baseline gap-4">
                            <span style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text)', letterSpacing: '-0.02em' }}>₹{product.price}</span>
                            <span className="text-muted" style={{ fontSize: '1.5rem', textDecoration: 'line-through' }}>₹{Math.round(product.price * 1.25)}</span>
                            <span style={{ color: 'var(--success)', fontWeight: 800, fontSize: '1rem' }}>20% OFF</span>
                        </div>
                    </div>

                    <p style={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'var(--text-muted)' }}>{product.description || "Indulge in the finest craftsmanship with this premium piece. Every detail has been meticulously curated to offer you an unparalleled experience of quality, style, and durability."}</p>

                    <div className="flex gap-4" style={{ marginTop: '1rem' }}>
                        <Link to="/checkout" className="btn btn-primary" style={{ flex: 3, padding: '1.5rem', fontSize: '1.2rem', borderRadius: '1.25rem' }}>
                            <ShoppingCart size={22} /> Add to Cart
                        </Link>
                        <button className="btn btn-secondary" style={{ flex: 1, padding: '1.5rem', borderRadius: '1.25rem', width: '70px', height: '100%', display: 'flex', justifyContent: 'center' }}>
                            <Heart size={24} />
                        </button>
                    </div>

                    {/* Features Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
                        <div className="glass-card flex items-center gap-4" style={{ padding: '1.25rem', borderRadius: '1.25rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                <Truck size={24} />
                            </div>
                            <div>
                                <h5 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Express Delivery</h5>
                                <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>Ships in 24 hours</p>
                            </div>
                        </div>
                        <div className="glass-card flex items-center gap-4" style={{ padding: '1.25rem', borderRadius: '1.25rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                <RotateCcw size={24} />
                            </div>
                            <div>
                                <h5 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Hassle-free Returns</h5>
                                <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>7-day policy</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
