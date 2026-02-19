import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { auth } from '../../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const TEST_CREDENTIALS = {
    '+917483743936': { otp: '123456', role: 'ADMIN' },
    '+919876543210': { otp: '123456', role: 'CONSUMER' }, // Test consumer number
    '+917676879059': { otp: '123456', role: 'CONSUMER' }, // Real phone - Test as consumer
    // Add more test numbers here as needed
};

export default function AuthModal({ isOpen, onClose, onSuccess, mode = 'consumer' }) {
    const [step, setStep] = useState('phone'); // 'phone' or 'otp'
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [isTestNumber, setIsTestNumber] = useState(false);
    const navigate = useNavigate();

    // Cleanup function for reCAPTCHA
    const cleanupRecaptcha = () => {
        if (window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier.clear();
            } catch (e) {
                console.log('Recaptcha clear error:', e);
            }
            window.recaptchaVerifier = null;
        }
    };

    // Cleanup on unmount or when modal closes
    useEffect(() => {
        return () => cleanupRecaptcha();
    }, []);

    // Also cleanup when isOpen changes to false
    useEffect(() => {
        if (!isOpen) {
            cleanupRecaptcha();
        }
    }, [isOpen]);

    // Initialize reCAPTCHA
    const setupRecaptcha = () => {
        cleanupRecaptcha();

        // Create new verifier
        try {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved
                },
                'expired-callback': () => {
                    cleanupRecaptcha();
                }
            });
        } catch (error) {
            console.error('Error creating recaptcha verifier:', error);
            cleanupRecaptcha();
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (phone.length < 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        const phoneNumber = `+91${phone}`;
        console.log("=== OTP SEND START ===");
        console.log("Phone entered:", phone);
        console.log("Full phone number:", phoneNumber);
        console.log("Is test credential:", !!TEST_CREDENTIALS[phoneNumber]);

        // FIRST: Check if this is a test number - if yes, skip Firebase entirely
        if (TEST_CREDENTIALS[phoneNumber]) {
            console.log("✓ TEST CREDENTIAL DETECTED - Skipping Firebase and reCAPTCHA");
            setIsTestNumber(true);
            setStep('otp');
            setError('');
            setConfirmationResult({ isTestMode: true });
            console.log("=== OTP SEND END (TEST MODE) ===");
            return; // EXIT EARLY - do not proceed to Firebase
        }

        // SECOND: Not a test credential - prepare Firebase
        console.log("✗ Not a test credential - Using Firebase");
        setIsTestNumber(false);
        setLoading(true);
        setError('');

        try {
            console.log("Setting up reCAPTCHA...");
            setupRecaptcha();

            // Wait a small tick to ensure verifier is set
            if (!window.recaptchaVerifier) {
                console.error("❌ reCAPTCHA Verifier not set immediately after setup!");
                throw new Error("Recaptcha initialization failed");
            }

            console.log("✓ reCAPTCHA initialized successfully");
            const appVerifier = window.recaptchaVerifier;

            console.log("Invoking signInWithPhoneNumber...");
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            console.log("✓ OTP Sent Successfully!");

            setConfirmationResult(confirmation);
            setStep('otp');
            setLoading(false);
            console.log("=== OTP SEND END (FIREBASE MODE) ===");
        } catch (err) {
            console.error('❌ Error sending OTP:', err);

            if (err.code === 'auth/invalid-app-credential') {
                setError('Security verification failed. Please refresh the page.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many attempts. Please wait a while.');
            } else {
                setError(`Failed to send OTP: ${err.message}`);
            }

            setLoading(false);

            // Reset reCAPTCHA
            cleanupRecaptcha();
            console.log("=== OTP SEND END (ERROR) ===");
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        console.log("=== OTP VERIFICATION START ===");
        console.log("OTP entered:", otp);
        console.log("Is test mode:", isTestNumber);

        setLoading(true);
        setError('');

        try {
            const phoneNumber = `+91${phone}`;
            let response;

            // Handle test mode
            if (isTestNumber && confirmationResult?.isTestMode) {
                console.log("✓ TEST MODE VERIFICATION");
                console.log("Calling /auth/test-login endpoint...");
                
                response = await fetch('http://localhost:5000/auth/test-login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ phone: phoneNumber, otp }),
                });
                
                console.log("Response status:", response.status);
            } else {
                // Handle real Firebase mode
                console.log("✗ FIREBASE MODE VERIFICATION");
                console.log("Confirming with Firebase...");
                
                const result = await confirmationResult.confirm(otp);
                const user = result.user;
                const idToken = await user.getIdToken();

                console.log("Calling /auth/login endpoint with Firebase token...");
                response = await fetch('http://localhost:5000/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ idToken }),
                });
                
                console.log("Response status:", response.status);
            }

            const data = await response.json();
            console.log("Backend response:", data);

            if (data.success) {
                // Store user data in localStorage
                const userData = {
                    uid: data.uid,
                    role: data.role,
                    phone: phoneNumber,
                    status: data.status
                };
                localStorage.setItem('user', JSON.stringify(userData));
                console.log("✓ User data stored in localStorage:", userData);

                // Dispatch custom event to notify ProtectedRoute of user data change
                window.dispatchEvent(
                    new CustomEvent('userDataChanged', {
                        detail: userData
                    })
                );
                console.log("✓ userDataChanged event dispatched");

                // Redirect based on role
                // ADMIN access is restricted to +917483743936 phone number
                if (data.role === 'ADMIN') {
                    const ADMIN_PHONE = '+917483743936';
                    console.log("Admin detected - Checking phone...");
                    if (phoneNumber === ADMIN_PHONE) {
                        console.log("✓ Admin phone matched - Redirecting to /admin");
                        navigate('/admin');
                    } else {
                        // Security: Non-admin phone trying to access admin
                        console.error(`❌ SECURITY WARNING: Non-admin phone ${phoneNumber} received ADMIN role`);
                        setError('Unauthorized admin access');
                        localStorage.removeItem('user');
                        setLoading(false);
                        return;
                    }
                } else if (data.role === 'SELLER') {
                    console.log("Seller detected - Checking status:", data.status);
                    if (data.status === 'APPROVED') {
                        console.log("✓ Approved seller - Redirecting to /seller/dashboard");
                        navigate('/seller/dashboard');
                    } else if (data.status === 'PENDING') {
                        alert('Your seller application is pending approval');
                        navigate('/');
                    } else if (data.status === 'REJECTED') {
                        alert('Your seller application was rejected');
                        navigate('/');
                    }
                } else {
                    // CONSUMER role or any other role
                    console.log("✓ Consumer detected - Redirecting to /");
                    navigate('/');
                }

                if (onSuccess) {
                    onSuccess(data);
                }
                onClose();
                console.log("=== OTP VERIFICATION END (SUCCESS) ===");
            } else {
                console.error("❌ Authentication failed:", data.message);
                setError(data.message || 'Authentication failed');
                console.log("=== OTP VERIFICATION END (FAILED) ===");
            }

            setLoading(false);
        } catch (err) {
            console.error('❌ Error verifying OTP:', err);
            setError('Invalid OTP. Please try again.');
            setLoading(false);
            console.log("=== OTP VERIFICATION END (ERROR) ===");
        }
    };

    const handleClose = () => {
        setStep('phone');
        setPhone('');
        setOtp('');
        setError('');
        setConfirmationResult(null);
        setIsTestNumber(false);
        cleanupRecaptcha();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: '1.5rem'
            }} onClick={handleClose}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="glass-card"
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        background: 'var(--background)',
                        position: 'relative',
                        padding: '2.5rem'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        onClick={handleClose}
                        style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.5 }}
                    >
                        <X size={20} />
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'hsla(230, 85%, 60%, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem'
                        }}>
                            {step === 'phone' ? <Phone color="var(--primary)" /> : <ShieldCheck color="var(--primary)" />}
                        </div>
                        <h2 style={{ fontSize: '1.5rem' }}>{step === 'phone' ? 'Welcome to ' : 'Verify '} <span className="gradient-text">SELLSATHI</span></h2>
                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                            {step === 'phone' ? 'Enter your mobile number to get started' : `Enter the 6-digit OTP sent to +91${phone}`}
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            marginBottom: '1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.5rem',
                            color: '#ef4444',
                            fontSize: '0.875rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={step === 'phone' ? handleSendOTP : handleVerify}>
                        {step === 'phone' ? (
                            <div className="flex flex-col gap-4">
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: '600', opacity: 0.7 }}>+91</span>
                                    <input
                                        type="tel"
                                        placeholder="Mobile Number"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        style={{ paddingLeft: '3.5rem', width: '100%' }}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '1rem' }}
                                    disabled={phone.length < 10 || loading}
                                >
                                    {loading ? 'Sending...' : 'Get OTP'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold', width: '100%' }}
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '1rem' }}
                                    disabled={otp.length < 6 || loading}
                                >
                                    {loading ? 'Verifying...' : 'Continue'} {!loading && <ArrowRight size={18} />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('phone');
                                        setOtp('');
                                        setError('');
                                        setIsTestNumber(false);
                                    }}
                                    style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '600' }}
                                    disabled={loading}
                                >
                                    Change Number
                                </button>
                            </div>
                        )}
                    </form>

                    <div id="recaptcha-container"></div>

                    <p style={{ marginTop: '2rem', fontSize: '0.75rem', textAlign: 'center' }} className="text-muted">
                        By continuing, you agree to our <span style={{ color: 'var(--primary)' }}>Terms of Service</span> and <span style={{ color: 'var(--primary)' }}>Privacy Policy</span>.
                    </p>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
