import { useState, useEffect } from 'react';
import { CreditCard, MapPin, ShoppingBag, Trash2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listenToCart, removeFromCart } from '../../utils/cartUtils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Checkout() {
    const [step, setStep] = useState(1);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = listenToCart((items) => {
            setCartItems(items);
            setLoading(false);
        });
        return () => unsubscribe && unsubscribe();
    }, []);

    const handleRemove = async (productId) => {
        await removeFromCart(productId);
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (!loading && cartItems.length === 0) {
        return (
            <div className="container animate-fade-in" style={{
                padding: '6rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                minHeight: '60vh'
            }}>
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'var(--primary-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '2.5rem',
                        color: 'var(--primary)'
                    }}
                >
                    <ShoppingBag size={56} />
                </motion.div>
                <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '900', marginBottom: '1rem' }}>
                    Your cart is <span className="gradient-text">Empty</span>
                </h1>
                <p className="text-muted" style={{ maxWidth: '450px', marginBottom: '3rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
                    It seems you haven't discovered anything yet. Explore our curated collections and fill your bag with treasures.
                </p>
                <Link to="/" className="btn btn-primary" style={{ padding: '1.25rem 3rem', borderRadius: '1.5rem', fontSize: '1.1rem' }}>
                    Start Exploring
                </Link>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', background: 'var(--background)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '4rem' }}>
                <h1 style={{ margin: 0, fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '900' }}>Complete your <span className="gradient-text">Purchase</span></h1>
                <div className="desktop-only flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: step >= 1 ? 'var(--primary)' : 'var(--border)' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, opacity: step >= 1 ? 1 : 0.5 }}>Details</span>
                    </div>
                    <div style={{ width: '40px', height: '1px', background: 'var(--border)' }} />
                    <div className="flex items-center gap-2">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: step >= 2 ? 'var(--primary)' : 'var(--border)' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, opacity: step >= 2 ? 1 : 0.5 }}>Payment</span>
                    </div>
                </div>
            </div>

            <div className="responsive-layout" style={{ gap: '3rem' }}>
                <div className="flex flex-col gap-8">
                    {/* Cart Items List */}
                    <div className="glass-card" style={{ padding: '2.5rem', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
                            <div className="flex items-center gap-3">
                                <ShoppingBag size={24} className="text-primary" />
                                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>Review Bag ({cartItems.length})</h3>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <AnimatePresence>
                                {cartItems.map((item) => (
                                    <motion.div 
                                        key={item.id} 
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex gap-6 items-center" 
                                        style={{
                                            padding: '1.25rem',
                                            background: 'var(--background)',
                                            borderRadius: '1.25rem',
                                            border: '1px solid var(--border)'
                                        }}
                                    >
                                        <img src={item.imageUrl} alt={item.name} style={{
                                            width: '80px',
                                            height: '80px',
                                            objectFit: 'cover',
                                            borderRadius: '1rem',
                                            flexShrink: 0
                                        }} />
                                        <div className="flex-1">
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem' }}>{item.name}</h4>
                                            <p className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Quantity: <span style={{ color: 'var(--text)', fontWeight: 700 }}>{item.quantity}</span></p>
                                        </div>
                                        <div className="flex flex-col items-end gap-3">
                                            <span style={{ fontWeight: '900', fontSize: '1.25rem', color: 'var(--text)' }}>₹{item.price * item.quantity}</span>
                                            <button
                                                onClick={() => handleRemove(item.id || item.productId)}
                                                className="btn btn-secondary"
                                                style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--error)',
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    border: 'none'
                                                }}
                                            >
                                                <Trash2 size={14} /> <span>Remove</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Step 1: Address */}
                    <motion.div 
                        initial={false}
                        animate={{ opacity: step >= 1 ? 1 : 0.5 }}
                        className="glass-card" 
                        style={{ padding: '2.5rem', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}
                    >
                        <div className="flex items-center gap-4" style={{ marginBottom: '2.5rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: step >= 1 ? 'var(--primary)' : 'var(--background)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: step >= 1 ? 'white' : 'var(--text-muted)',
                                fontWeight: '900',
                                fontSize: '1.1rem'
                            }}>1</div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>Shipping Destination</h3>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1.5rem'
                        }}>
                            <div className="flex flex-col gap-2" style={{ gridColumn: 'span 1' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>First Name</label>
                                <input type="text" placeholder="John" style={{ height: '54px', borderRadius: '12px', padding: '0 1rem', border: '1px solid var(--border)', background: 'var(--background)' }} />
                            </div>
                            <div className="flex flex-col gap-2" style={{ gridColumn: 'span 1' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Last Name</label>
                                <input type="text" placeholder="Doe" style={{ height: '54px', borderRadius: '12px', padding: '0 1rem', border: '1px solid var(--border)', background: 'var(--background)' }} />
                            </div>
                            <div className="flex flex-col gap-2" style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Delivery Address</label>
                                <input type="text" placeholder="Street name, landmark, house no." style={{ height: '54px', borderRadius: '12px', padding: '0 1rem', border: '1px solid var(--border)', background: 'var(--background)' }} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Step 2: Payment */}
                    <motion.div 
                        animate={{ opacity: step < 2 ? 0.6 : 1, y: step === 2 ? 0 : 0 }}
                        className="glass-card" 
                        style={{ padding: '2.5rem', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}
                    >
                        <div className="flex items-center gap-4" style={{ marginBottom: '2.5rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: step >= 2 ? 'var(--primary)' : 'var(--background)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: step >= 2 ? 'white' : 'var(--text-muted)',
                                fontWeight: '900',
                                fontSize: '1.1rem'
                            }}>{step > 2 ? <CheckCircle2 size={24} /> : '2'}</div>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>Secure Payment</h3>
                        </div>

                        <div className="flex flex-col gap-4">
                            <label className="flex items-center gap-5 cursor-pointer" style={{ 
                                padding: '1.5rem', 
                                border: '2px solid var(--primary)', 
                                borderRadius: '1.25rem',
                                background: 'linear-gradient(to right, var(--primary-soft), transparent)'
                            }}>
                                <input type="radio" name="payment" defaultChecked style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
                                    <CreditCard size={24} />
                                </div>
                                <div className="flex-1">
                                    <p style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>Credit or Debit Card</p>
                                    <small className="text-muted" style={{ fontWeight: 500 }}>Secure encrypted transaction</small>
                                </div>
                            </label>
                            {/* More methods as needed */}
                        </div>
                    </motion.div>
                </div>

                {/* Order Summary - Sticky Sidebar */}
                <aside style={{ position: 'relative' }}>
                    <div className="glass-card sticky-top" style={{ 
                        top: '120px', 
                        padding: '2.5rem', 
                        border: 'none', 
                        background: 'var(--surface)',
                        boxShadow: 'var(--shadow-premium)',
                        borderRadius: '2rem'
                    }}>
                        <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: '900' }}>Summary</h3>
                        <div className="flex flex-col gap-5">
                            <div className="flex justify-between items-center">
                                <span className="text-muted" style={{ fontWeight: 600 }}>Subtotal ({cartItems.length} items)</span>
                                <span style={{ fontWeight: 800 }}>₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted" style={{ fontWeight: 600 }}>Handling & Shipping</span>
                                <span style={{ color: 'var(--success)', fontWeight: 800 }}>FREE</span>
                            </div>
                            <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 0' }} />
                            <div className="flex justify-between items-center" style={{ fontSize: '1.75rem', fontWeight: '900' }}>
                                <span>Total</span>
                                <span className="gradient-text">₹{subtotal}</span>
                            </div>

                            <button
                                onClick={() => step === 1 ? setStep(2) : (window.location.href = '/track')}
                                className="btn btn-primary"
                                style={{ marginTop: '1.5rem', width: '100%', padding: '1.5rem', fontSize: '1.25rem', borderRadius: '1.25rem' }}
                            >
                                {step === 1 ? 'Continue to Payment' : 'Complete Luxury Order'}
                            </button>
                            
                            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem', fontWeight: 500 }}>
                                <Shield size={14} style={{ display: 'inline', marginRight: '4px' }} /> 100% Secure Checkout
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
