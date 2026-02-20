import { useState, useEffect, useRef } from 'react';
import {
    CreditCard,
    MapPin,
    ShoppingBag,
    Trash2,
    Banknote,
    ShoppingCart,
    Shield,
    Package,
    CheckCircle2,
    CheckCircle,
    X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { listenToCart, removeFromCart, clearCart } from '../../utils/cartUtils';

import { auth, db } from '../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Checkout() {
    const [step, setStep] = useState(1);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentId, setPaymentId] = useState('');
    const [shippingAddress, setShippingAddress] = useState({
        firstName: '',
        lastName: '',
        addressLine: '',
        city: '',
        pincode: ''
    });
    const firstNameRef = useRef(null);
    const lastNameRef = useRef(null);
    const addressRef = useRef(null);
    const cityRef = useRef(null);
    const pincodeRef = useRef(null);
    const paymentSectionRef = useRef(null);

    const [paymentMethod, setPaymentMethod] = useState('online');
    const [errors, setErrors] = useState({});
    const [isOrdered, setIsOrdered] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [user, setUser] = useState(null);
    const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);
    const [fetchingSavedAddress, setFetchingSavedAddress] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (u) => {
            setUser(u);
            if (u) {
                setFetchingSavedAddress(true);
                try {
                    const docRef = doc(db, "users", u.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists() && docSnap.data().savedAddress) {
                        setShippingAddress(docSnap.data().savedAddress);
                    }
                } catch (error) {
                    console.error("Error fetching saved address:", error);
                } finally {
                    setFetchingSavedAddress(false);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribe = listenToCart((items) => {
            setCartItems(items);
            setLoading(false);
        });
        return () => unsubscribe && unsubscribe();
    }, []);

    // Scroll to payment section when moving to step 2
    useEffect(() => {
        if (step === 2 && paymentSectionRef.current) {
            paymentSectionRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, [step]);

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        if (name === 'pincode') {
            const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
            setShippingAddress(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setShippingAddress(prev => ({ ...prev, [name]: value }));
        }
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const scrollToField = (ref) => {
        if (ref?.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            ref.current.focus();
            ref.current.classList.add('ring-4', 'ring-red-400');
            setTimeout(() => {
                ref.current.classList.remove('ring-4', 'ring-red-400');
            }, 2000);
        }
    };

    const validateAddressForm = () => {
        const newErrors = {};
        if (!shippingAddress.firstName.trim()) {
            newErrors.firstName = 'First name is required';
            scrollToField(firstNameRef);
        } else if (!shippingAddress.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
            scrollToField(lastNameRef);
        } else if (!shippingAddress.addressLine.trim() || shippingAddress.addressLine.length < 5) {
            newErrors.addressLine = 'Full address is required';
            scrollToField(addressRef);
        } else if (!shippingAddress.city.trim()) {
            newErrors.city = 'City is required';
            scrollToField(cityRef);
        } else if (!/^\d{6}$/.test(shippingAddress.pincode)) {
            newErrors.pincode = 'Pincode must be exactly 6 digits';
            scrollToField(pincodeRef);
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRemove = async (productId) => {
        await removeFromCart(productId);
    };

    const handleContinue = () => {
        if (step === 1) {
            if (validateAddressForm()) {
                if (saveAddressForFuture && user) {
                    try {
                        const userRef = doc(db, "users", user.uid);
                        setDoc(userRef, {
                            savedAddress: shippingAddress,
                            lastUpdated: new Date().toISOString()
                        }, { merge: true });
                    } catch (error) {
                        console.error("Error saving address:", error);
                    }
                }
                setStep(2);
            } else {
                alert('Please fill in all required address fields correctly.');
            }
        }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const getCustomerInfo = () => ({
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        address: {
            line: shippingAddress.addressLine,
            city: shippingAddress.city,
            pincode: shippingAddress.pincode,
        },
    });

    // ─── Razorpay Online Payment ───────────────────────────────────────────────
    const handleRazorpayPayment = async () => {
        if (subtotal <= 0) {
            setErrors({ payment: 'Cart is empty' });
            return;
        }
        if (!window.Razorpay) {
            setErrors({ payment: 'Payment gateway is not ready. Please refresh the page.' });
            return;
        }

        setPaymentLoading(true);
        setErrors({});

        try {
            const currentUser = auth.currentUser;

            // STEP 1 – Create Razorpay order on backend
            const orderResponse = await fetch('http://localhost:5000/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: subtotal,
                    cartItems,
                    customerInfo: getCustomerInfo(),
                }),
            });

            const orderData = await orderResponse.json();

            if (!orderData.success) {
                setErrors({ payment: orderData.message || 'Failed to create payment order' });
                setPaymentLoading(false);
                return;
            }

            // STEP 2 – Open Razorpay secure checkout popup
            const options = {
                key: orderData.key_id,
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: 'SellSathi',
                description: `Payment for ${cartItems.length} item(s)`,
                order_id: orderData.order.id,

                handler: async function (response) {
                    // STEP 3 – Verify payment signature on backend
                    try {
                        const verifyResponse = await fetch('http://localhost:5000/payment/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                cartItems,
                                customerInfo: getCustomerInfo(),
                                amount: subtotal,
                                uid: currentUser?.uid || null,
                            }),
                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyData.success) {
                            await clearCart();
                            setOrderId(verifyData.orderId);
                            setPaymentId(verifyData.paymentId);
                            setIsOrdered(true);
                        } else {
                            setErrors({ payment: verifyData.message || 'Payment verification failed' });
                        }
                    } catch (err) {
                        console.error('Verify error:', err);
                        setErrors({ payment: 'Payment verification failed. Please contact support.' });
                    }
                    setPaymentLoading(false);
                },

                prefill: {
                    contact: user?.phoneNumber || user?.phone || '',
                },

                modal: {
                    ondismiss: () => setPaymentLoading(false)
                },

                theme: {
                    color: "#4f46e5"
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                setErrors({ payment: response.error.description || 'Payment failed. Please try again.' });
                setPaymentLoading(false);
            });

            rzp.open();

        } catch (err) {
            console.error('Razorpay error:', err);
            setErrors({ payment: 'Something went wrong. Please try again.' });
            setPaymentLoading(false);
        }
    };

    // ─── Cash on Delivery ─────────────────────────────────────────────────────
    const handleCODOrder = async () => {
        setPaymentLoading(true);
        setErrors({});

        try {
            const currentUser = auth.currentUser;

            const response = await fetch('http://localhost:5000/payment/cod-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cartItems,
                    customerInfo: getCustomerInfo(),
                    amount: subtotal,
                    uid: currentUser?.uid || null,
                }),
            });

            const data = await response.json();

            if (data.success) {
                await clearCart();
                setOrderId(data.orderId);
                setIsOrdered(true);
            } else {
                setErrors({ payment: data.message || 'Failed to place order' });
            }
        } catch (err) {
            console.error('COD order error:', err);
            setErrors({ payment: 'Failed to place order. Please try again.' });
        } finally {
            setPaymentLoading(false);
        }
    };

    // ─── Order Confirmed Screen ────────────────────────────────────────────────
    if (isOrdered) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-6 bg-gray-50/20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="max-w-2xl w-full bg-white rounded-[3rem] border border-gray-100 shadow-2xl p-12 text-center space-y-8 relative overflow-hidden"
                >
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-green-500/5 rounded-full blur-3xl" />

                    <div className="relative">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                            className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/30"
                        >
                            <CheckCircle2 size={56} className="text-white" strokeWidth={2.5} />
                        </motion.div>

                        <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-tight">
                            Order <span className="gradient-text">Confirmed</span>
                        </h1>
                        <p className="text-gray-500 text-lg font-medium mt-4 max-w-sm mx-auto">
                            Thank you for your purchase, {shippingAddress.firstName}! Your order is being processed.
                        </p>
                    </div>

                    <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-gray-400">ORDER ID</span>
                            <span className="text-gray-900 font-mono">#{orderId}</span>
                        </div>
                        <div className="h-px bg-gray-100 w-full" />
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-gray-400">PAYMENT</span>
                            <span className={`font-black uppercase ${paymentMethod === 'online' ? 'text-primary' : 'text-primary'}`}>
                                {paymentMethod === 'online' ? 'Online (Razorpay)' : 'Cash on Delivery'}
                            </span>
                        </div>
                        {paymentId && (
                            <>
                                <div className="h-px bg-gray-100 w-full" />
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-gray-400">PAYMENT REF</span>
                                    <span className="text-gray-900 font-mono text-xs">{paymentId}</span>
                                </div>
                            </>
                        )}
                        <div className="h-px bg-gray-100 w-full" />
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-400">TOTAL</span>
                            <span className="text-2xl font-black text-primary">₹{subtotal.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={() => window.location.href = `/track?orderId=${orderId}`}
                            className="flex-1 py-5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Track Detailed Status
                        </button>
                        <Link
                            to="/"
                            className="flex-1 py-5 bg-white text-gray-600 rounded-2xl font-black border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all text-center"
                        >
                            Continue Shopping
                        </Link>
                    </div>

                    <p className="text-xs text-gray-400 font-bold">
                        A confirmation email has been sent to {user?.email}
                    </p>
                </motion.div>
            </div>
        );
    }

    // ─── Main Checkout Flow ────────────────────────────────────────────────────
    return (
        <div className="bg-gray-50/20 min-h-screen">
            <div className="container px-6 py-12 max-w-7xl mx-auto">
                <div className="mb-10 flex flex-col gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                            Checkout <span className="text-gray-400 font-light">Process</span>
                        </h1>
                        <p className="text-gray-500 font-medium mt-2">Securely complete your purchase at Sellsathi</p>
                    </div>

                    {/* Progress stepper */}
                    <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-500">
                        {['Cart', 'Address', 'Payment', 'Confirmation'].map((label, index) => {
                            const currentIndex = index + 1;
                            const isDone = currentIndex < (step === 1 ? 2 : 3);
                            const isActive = (step === 1 && currentIndex === 2) || (step === 2 && currentIndex === 3);
                            return (
                                <div key={label} className="flex items-center gap-2">
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                        ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}
                                    >
                                        {currentIndex}
                                    </div>
                                    <span className={`${isDone || isActive ? 'text-gray-900' : ''}`}>{label}</span>
                                    {index !== 3 && <span className="mx-2 text-gray-300">›</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
                    <div className="xl:col-span-8 space-y-8">

                        {/* Cart Items */}
                        <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <ShoppingBag size={22} className="text-primary" />
                                    Your Items ({cartItems.length})
                                </h3>
                            </div>
                            <div className="p-8 space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-6 items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 group hover:bg-white hover:border-primary/20 transition-all">
                                        <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm">
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 mb-1">{item.name}</h4>
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                                <span>Qty: {item.quantity}</span>
                                                <span>•</span>
                                                <span className="text-primary">₹{item.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3">
                                            <span className="text-lg font-black text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                                            <button
                                                onClick={() => handleRemove(item.id || item.productId)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remove"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Step 1: Address */}
                        <section className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all ${step > 1 ? 'opacity-90' : ''}`}>
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg shadow-primary/20">1</div>
                                    Shipping Information
                                </h3>
                                {step === 2 && (
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-4 py-2 text-primary font-bold hover:bg-primary/5 rounded-xl transition-all"
                                    >
                                        Edit Address
                                    </button>
                                )}
                            </div>

                            <div className="p-8">
                                {step === 1 ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">First Name</label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    ref={firstNameRef}
                                                    value={shippingAddress.firstName}
                                                    onChange={handleAddressChange}
                                                    placeholder="John"
                                                    className={`w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-4 ring-primary/10 transition-all outline-none ${errors.firstName ? 'ring-2 ring-red-500/20' : ''}`}
                                                />
                                                {errors.firstName && <small className="text-red-500 font-bold text-xs ml-1">{errors.firstName}</small>}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Last Name</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    ref={lastNameRef}
                                                    value={shippingAddress.lastName}
                                                    onChange={handleAddressChange}
                                                    placeholder="Doe"
                                                    className={`w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-4 ring-primary/10 transition-all outline-none ${errors.lastName ? 'ring-2 ring-red-500/20' : ''}`}
                                                />
                                                {errors.lastName && <small className="text-red-500 font-bold text-xs ml-1">{errors.lastName}</small>}
                                            </div>
                                            <div className="space-y-1 md:col-span-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Delivery Address</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        name="addressLine"
                                                        ref={addressRef}
                                                        value={shippingAddress.addressLine}
                                                        onChange={handleAddressChange}
                                                        placeholder="Street, Building, Flat"
                                                        className={`w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-4 ring-primary/10 transition-all outline-none ${errors.addressLine ? 'ring-2 ring-red-500/20' : ''}`}
                                                    />
                                                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300" size={18} />
                                                </div>
                                                {errors.addressLine && <small className="text-red-500 font-bold text-xs ml-1">{errors.addressLine}</small>}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">City</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    ref={cityRef}
                                                    value={shippingAddress.city}
                                                    onChange={handleAddressChange}
                                                    placeholder="Bangalore"
                                                    className={`w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-4 ring-primary/10 transition-all outline-none ${errors.city ? 'ring-2 ring-red-500/20' : ''}`}
                                                />
                                                {errors.city && <small className="text-red-500 font-bold text-xs ml-1">{errors.city}</small>}
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Pincode</label>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    ref={pincodeRef}
                                                    value={shippingAddress.pincode}
                                                    onChange={handleAddressChange}
                                                    placeholder="560XXX"
                                                    maxLength={6}
                                                    className={`w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-4 ring-primary/10 transition-all outline-none ${errors.pincode ? 'ring-2 ring-red-500/20' : ''}`}
                                                />
                                                {errors.pincode && <small className="text-red-500 font-bold text-xs ml-1">{errors.pincode}</small>}
                                            </div>
                                        </div>

                                        <div className="mt-10 pt-8 border-t border-gray-50 flex flex-col items-center gap-6">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${saveAddressForFuture ? 'bg-primary border-primary shadow-lg shadow-primary/20 scale-110' : 'border-gray-200 group-hover:border-gray-300'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={saveAddressForFuture}
                                                        onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                                                        className="hidden"
                                                    />
                                                    {saveAddressForFuture && <CheckCircle2 size={16} className="text-white" />}
                                                </div>
                                                <span className="text-xs font-bold text-gray-500">Securely save this address for faster checkout later</span>
                                            </label>
                                            <button
                                                className="w-full sm:w-auto px-12 py-5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-lg"
                                                onClick={handleContinue}
                                                disabled={fetchingSavedAddress}
                                            >
                                                {fetchingSavedAddress ? 'Syncing...' : 'Continue to Payment Selection'}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    // Compact address summary when on payment step
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Deliver to</p>
                                            <p className="text-sm font-bold text-gray-900">
                                                {shippingAddress.firstName} {shippingAddress.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500 max-w-md mt-1">
                                                {shippingAddress.addressLine}, {shippingAddress.city} - {shippingAddress.pincode}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setStep(1)}
                                            className="px-4 py-2 text-primary font-bold text-xs border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors"
                                        >
                                            Change Address
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Step 2: Payment */}
                        <section
                            ref={paymentSectionRef}
                            className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all ${step < 2 ? 'opacity-50 pointer-events-none grayscale' : ''}`}
                        >
                            <div className="p-8 border-b border-gray-50">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg shadow-primary/20">2</div>
                                    Secure Payment Method
                                </h3>
                            </div>

                            <div className="p-8 space-y-4">
                                <div className="grid grid-cols-1 gap-4">

                                    {/* ── Online Payment via Razorpay ── */}
                                    <div
                                        onClick={() => setPaymentMethod('online')}
                                        className={`p-6 rounded-3xl border-2 transition-all cursor-pointer group ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === 'online' ? 'bg-primary text-white' : 'bg-white text-gray-400 group-hover:text-primary'}`}>
                                                <CreditCard size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">Pay Online</h4>
                                                <p className="text-xs text-gray-400 font-medium">Cards, UPI, NetBanking &amp; Wallets via Razorpay</p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'online' ? 'border-primary bg-primary' : 'border-gray-200'}`}>
                                                {paymentMethod === 'online' && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {paymentMethod === 'online' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-6 pt-6 border-t border-primary/10 overflow-hidden space-y-4"
                                                >
                                                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex gap-3 items-center">
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                                                            <Shield size={20} />
                                                        </div>
                                                        <div>
                                                            <h5 className="text-xs font-black text-gray-900 leading-none mb-1">Secure Payment via Razorpay</h5>
                                                            <p className="text-[10px] text-gray-400 font-bold">Cards, UPI, Netbanking &amp; Wallets accepted</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-medium px-1">
                                                        You'll be redirected to Razorpay's secure checkout to complete your payment. All major cards, UPI, netbanking &amp; wallets are accepted.
                                                    </p>
                                                    {errors.payment && (
                                                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-2xl border border-red-100">
                                                            <X size={16} className="text-red-500 flex-shrink-0" />
                                                            <span className="text-red-600 font-bold text-xs">{errors.payment}</span>
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        disabled={paymentLoading || subtotal <= 0}
                                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleRazorpayPayment();
                                                        }}
                                                    >
                                                        <Shield size={18} />
                                                        {paymentLoading ? "Processing..." : `Pay ₹${subtotal.toLocaleString()} Securely`}
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* ── Cash on Delivery ── */}
                                    <div
                                        onClick={() => setPaymentMethod('cod')}
                                        className={`p-6 rounded-3xl border-2 transition-all cursor-pointer group ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${paymentMethod === 'cod' ? 'bg-primary text-white' : 'bg-white text-gray-400 group-hover:text-primary'}`}>
                                                <Banknote size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">Cash on Delivery</h4>
                                                <p className="text-xs text-gray-400 font-medium">Pay when you receive the order</p>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary bg-primary' : 'border-gray-200'}`}>
                                                {paymentMethod === 'cod' && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {paymentMethod === 'cod' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="mt-6 pt-6 border-t border-primary/10 overflow-hidden space-y-4"
                                                >
                                                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex gap-3 items-start">
                                                        <CheckCircle size={16} className="text-primary flex-shrink-0 mt-0.5" />
                                                        <p className="text-xs text-gray-600 font-medium">
                                                            Pay cash upon delivery. No online payment required. Consider paying online for a safer and contactless experience.
                                                        </p>
                                                    </div>
                                                    {errors.payment && (
                                                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-2xl border border-red-100">
                                                            <X size={16} className="text-red-500 flex-shrink-0" />
                                                            <span className="text-red-600 font-bold text-xs">{errors.payment}</span>
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        disabled={paymentLoading || subtotal <= 0}
                                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleCODOrder();
                                                        }}
                                                    >
                                                        <Banknote size={18} />
                                                        {paymentLoading ? "Placing Order..." : `Place Order (COD) - ₹${subtotal.toLocaleString()}`}
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="xl:col-span-4 lg:sticky lg:top-10">
                        <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                            <div className="p-8 border-b border-gray-50">
                                <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
                                <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    Payments securely processed via Razorpay
                                </p>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-bold text-sm">Cart Subtotal</span>
                                        <span className="text-gray-900 font-black">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-bold text-sm">Shipping Fee</span>
                                        <span className="text-green-500 font-black uppercase text-xs">Free</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400 font-bold text-sm">Platform Tax</span>
                                        <span className="text-gray-900 font-black">₹0.00</span>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-50 w-full" />

                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-gray-900 font-black text-lg">Total Amount</span>
                                        <span className="text-3xl font-black text-primary">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <p className="text-[10px] text-green-600 font-bold text-right uppercase tracking-widest">
                                        Save with Sellsathi Premium
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex gap-3 items-center">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-black text-gray-900 leading-none mb-1">Guaranteed Safety</h5>
                                            <p className="text-[10px] text-gray-400 font-bold">100% Secure Transaction System</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50/50 p-6 flex flex-col items-center gap-3">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
                                    ))}
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-primary text-[8px] flex items-center justify-center text-white font-black">+2k</div>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold">Consumers recently purchased here</p>
                            </div>
                        </section>

                        <div className="mt-6 flex items-center justify-center gap-6 grayscale opacity-30">
                            <Shield size={24} />
                            <Package size={24} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
