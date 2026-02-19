import { useState, useEffect } from 'react';
import { CreditCard, MapPin, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listenToCart, removeFromCart } from '../../utils/cartUtils';

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
                padding: '8rem 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'var(--surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '2rem'
                }}>
                    <ShoppingBag size={48} className="text-muted" />
                </div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Your cart is <span className="gradient-text">Empty</span></h1>
                <p className="text-muted" style={{ maxWidth: '400px', marginBottom: '2.5rem' }}>
                    Looks like you haven't added anything to your cart yet.
                    Explore our amazing products and start shopping!
                </p>
                <Link to="/" className="btn btn-primary" style={{ padding: '1rem 3rem' }}>
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '4rem 0' }}>
            <h1 style={{ marginBottom: '3rem' }}>Checkout</h1>

            <div className="flex gap-12">
                <div style={{ flex: 1.5 }} className="flex flex-col gap-8">
                    {/* Cart Items List */}
                    <div className="glass-card">
                        <div className="flex items-center gap-3" style={{ marginBottom: '1.5rem' }}>
                            <ShoppingBag size={20} className="text-muted" />
                            <h3>Your Items ({cartItems.length})</h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex gap-4 items-center" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                                    <img src={item.imageUrl} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                    <div className="flex-1">
                                        <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{item.name}</h4>
                                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Qty: {item.quantity}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</span>
                                        <button
                                            onClick={() => handleRemove(item.id || item.productId)}
                                            className="text-muted"
                                            style={{ fontSize: '0.75rem', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <Trash2 size={14} /> Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 1: Address */}
                    <div className="glass-card">
                        <div className="flex items-center gap-3" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 1 ? 'var(--primary)' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>1</div>
                            <h3>Shipping Address</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <input type="text" placeholder="First Name" />
                            <input type="text" placeholder="Last Name" />
                            <input type="text" placeholder="Address Line 1" style={{ gridColumn: 'span 2' }} />
                            <input type="text" placeholder="City" />
                            <input type="text" placeholder="Pincode" />
                        </div>
                    </div>

                    {/* Step 2: Payment */}
                    <div className="glass-card" style={{ opacity: step < 2 ? 0.5 : 1 }}>
                        <div className="flex items-center gap-3" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 2 ? 'var(--primary)' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>2</div>
                            <h3>Payment Method</h3>
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="glass-card flex items-center gap-4 cursor-pointer" style={{ padding: '1rem' }}>
                                <input type="radio" name="payment" defaultChecked />
                                <CreditCard size={20} />
                                <div className="flex-1">
                                    <strong>Card</strong><br />
                                    <small className="text-muted">Debit / Credit Card</small>
                                </div>
                            </label>
                            <label className="glass-card flex items-center gap-4 cursor-pointer" style={{ padding: '1rem' }}>
                                <input type="radio" name="payment" />
                                <MapPin size={20} />
                                <div className="flex-1">
                                    <strong>UPI</strong><br />
                                    <small className="text-muted">GPay, PhonePe, etc.</small>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div style={{ flex: 1 }}>
                    <div className="glass-card" style={{ position: 'sticky', top: '6rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Order Summary</h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted">Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted">Shipping</span>
                                <span style={{ color: 'var(--success)' }}>FREE</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted">Tax</span>
                                <span>₹0.00</span>
                            </div>
                            <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                            <div className="flex justify-between items-center" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                                <span>Total</span>
                                <span className="gradient-text">₹{subtotal}</span>
                            </div>

                            <button
                                onClick={() => step === 1 ? setStep(2) : (window.location.href = '/track')}
                                className="btn btn-primary"
                                style={{ marginTop: '1rem', width: '100%', padding: '1rem' }}
                            >
                                {step === 1 ? 'Continue to Payment' : 'Complete Order'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
