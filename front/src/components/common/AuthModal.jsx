import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, ShieldCheck, ArrowRight, User as UserIcon, Mail, Lock } from 'lucide-react';
import { auth } from '../../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const TEST_CREDENTIALS = {
    '+917483743936': { otp: '123456', role: 'ADMIN' },
    '+919876543210': { otp: '123456', role: 'CONSUMER' },
    '+917676879059': { otp: '123456', role: 'CONSUMER' },
};

export default function AuthModal({ isOpen, onClose, onSuccess, mode = 'consumer' }) {

    const [step, setStep] = useState('phone');
    const [isRegistering, setIsRegistering] = useState(false);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [isTestNumber, setIsTestNumber] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreedToTerms: false,
        agreedToPrivacy: false
    });

    const navigate = useNavigate();

    // ---------------------------
    // 🛡️ Recaptcha Cleanup
    // ---------------------------
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

    useEffect(() => {
        return () => cleanupRecaptcha();
    }, []);

    useEffect(() => {
        if (!isOpen) {
            cleanupRecaptcha();
            setStep('phone');
            setPhone('');
            setOtp('');
            setError('');
            setIsRegistering(false);
        }
    }, [isOpen]);

    const setupRecaptcha = () => {
        cleanupRecaptcha();
        try {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
                callback: () => { },
                'expired-callback': () => {
                    console.warn("reCAPTCHA expired");
                    cleanupRecaptcha();
                }
            });
        } catch (error) {
            console.error("Recaptcha Init Failed:", error);
            cleanupRecaptcha();
        }
    };

    // ---------------------------
    // 📲 SEND OTP
    // ---------------------------
    const handleSendOTP = async (e) => {

        if (e) e.preventDefault();

        if (phone.length < 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        if (isRegistering) {

            if (!formData.fullName.trim() || !formData.email.trim() || !formData.password.trim()) {
                setError('Fill all registration details');
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return;
            }

            if (!formData.agreedToTerms || !formData.agreedToPrivacy) {
                setError('Agree to Terms & Privacy Policy');
                return;
            }
        }

        const phoneNumber = `+91${phone}`;
        setError('');

        console.log("OTP SEND START:", phoneNumber);

        if (TEST_CREDENTIALS[phoneNumber]) {
            console.log("Test Mode Activated");
            setIsTestNumber(true);
            setStep('otp');
            setConfirmationResult({ isTestMode: true });
            return;
        }

        setIsTestNumber(false);
        setLoading(true);

        try {
            setupRecaptcha();

            if (!window.recaptchaVerifier) {
                throw new Error("Recaptcha not initialized");
            }

            const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
            setConfirmationResult(confirmation);
            setStep('otp');

        } catch (err) {
            console.error("OTP Send Error:", err);

            if (err.code === 'auth/too-many-requests') {
                setError('Too many requests. Try later.');
            } else if (err.code === 'auth/invalid-app-credential') {
                setError('Security verification failed.');
            } else {
                setError('OTP sending failed.');
            }

            cleanupRecaptcha();
        }

        setLoading(false);
    };

    // ---------------------------
    // 🔐 VERIFY OTP OR REGISTER
    // ---------------------------
    const handleVerifyOrRegister = async (e) => {

        e.preventDefault();

        if (otp.length !== 6) {
            setError('Enter valid OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {

            const phoneNumber = `+91${phone}`;
            let idToken = null;

            if (!isTestNumber || !confirmationResult?.isTestMode) {

                if (!confirmationResult) {
                    throw new Error("ConfirmationResult Missing");
                }

                const result = await confirmationResult.confirm(otp);
                idToken = await result.user.getIdToken();
            }

            const endpoint = isRegistering
                ? 'http://localhost:5000/auth/register'
                : (isTestNumber
                    ? 'http://localhost:5000/auth/test-login'
                    : 'http://localhost:5000/auth/login');

            const payload = isRegistering
                ? {
                    idToken,
                    phone: phoneNumber,
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    isTest: isTestNumber,
                    otp: isTestNumber ? otp : undefined
                }
                : (isTestNumber
                    ? { phone: phoneNumber, otp }
                    : { idToken });

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            console.log("Backend Response:", data);

            if (data.success) {

                const userData = {
                    uid: data.uid,
                    role: data.role,
                    phone: phoneNumber,
                    status: data.status
                };

                localStorage.setItem('user', JSON.stringify(userData));

                window.dispatchEvent(new CustomEvent('userDataChanged', {
                    detail: userData
                }));

                // ADMIN SECURITY
                if (data.role === 'ADMIN') {

                    const ADMIN_PHONE = '+917483743936';

                    if (phoneNumber === ADMIN_PHONE) {
                        navigate('/admin');
                    } else {
                        console.error("Unauthorized Admin Attempt");
                        localStorage.removeItem('user');
                        setError('Unauthorized admin access');
                        setLoading(false);
                        return;
                    }

                }
                else if (data.role === 'SELLER') {

                    if (data.status === 'APPROVED') {
                        navigate('/seller/dashboard');
                    }
                    else if (data.status === 'PENDING') {
                        alert('Seller approval pending');
                        navigate('/');
                    }
                    else {
                        alert('Seller rejected');
                        navigate('/');
                    }
                }
                else {
                    navigate('/');
                }

                if (onSuccess) onSuccess(data);
                handleClose();

            } else {
                setError(data.message || "Authentication Failed");
            }

        } catch (err) {
            console.error("OTP Verification Error:", err);
            setError("Invalid OTP");
        }

        setLoading(false);
    };

    const handleClose = () => {
        setStep('phone');
        setPhone('');
        setOtp('');
        setError('');
        setConfirmationResult(null);
        setIsTestNumber(false);
        setIsRegistering(false);
        cleanupRecaptcha();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-black/20 overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header Image/Pattern */}
                    <div className="h-24 bg-gradient-to-br from-primary to-blue-600 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                <circle cx="10" cy="10" r="20" fill="white" />
                                <circle cx="90" cy="90" r="30" fill="white" />
                                <circle cx="50" cy="50" r="25" fill="white" />
                            </svg>
                        </div>
                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white text-white hover:text-primary rounded-full flex items-center justify-center transition-all z-10"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-10 -mt-8 bg-white rounded-t-[2.5rem] relative">
                        <div className="mb-8 text-center">
                            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                                {step === 'phone' ? <Phone size={30} /> : <ShieldCheck size={30} />}
                            </div>
                            <h2 className="text-3xl font-black text-slate-900">
                                {isRegistering ? 'Join Sellsathi' : (step === 'phone' ? 'Welcome Back' : 'Verify Access')}
                            </h2>
                            <p className="text-slate-500 font-medium mt-2">
                                {isRegistering
                                    ? 'Start your premium shopping journey'
                                    : (step === 'phone' ? 'Enter your phone to continue' : 'Enter the 6-digit code sent to you')}
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2 border border-red-100"
                            >
                                <X size={14} className="bg-red-500 text-white rounded-full p-0.5" />
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={step === 'phone' ? handleSendOTP : handleVerifyOrRegister} className="space-y-4">
                            {step === 'phone' ? (
                                <>
                                    {isRegistering && (
                                        <div className="space-y-4 mb-6">
                                            <div className="relative">
                                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Your Full Name"
                                                    value={formData.fullName}
                                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-4 ring-primary/10 transition-all outline-none"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input
                                                    type="email"
                                                    placeholder="Email Address"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-4 ring-primary/10 transition-all outline-none"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input
                                                    type="password"
                                                    placeholder="Create Password"
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-4 ring-primary/10 transition-all outline-none"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input
                                                    type="password"
                                                    placeholder="Confirm Password"
                                                    value={formData.confirmPassword}
                                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-4 ring-primary/10 transition-all outline-none"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-3 px-1">
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.agreedToTerms}
                                                        onChange={e => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                                                        className="w-5 h-5 rounded-lg border-slate-200 text-primary focus:ring-primary/20"
                                                    />
                                                    <span className="text-xs text-slate-500 font-medium group-hover:text-slate-700">Agree to Terms & Conditions</span>
                                                </label>
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.agreedToPrivacy}
                                                        onChange={e => setFormData({ ...formData, agreedToPrivacy: e.target.checked })}
                                                        className="w-5 h-5 rounded-lg border-slate-200 text-primary focus:ring-primary/20"
                                                    />
                                                    <span className="text-xs text-slate-500 font-medium group-hover:text-slate-700">Accept Privacy Policy</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-3 border-r border-slate-200">
                                            <span className="text-slate-400 font-bold text-sm">+91</span>
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="Phone Number"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="w-full pl-20 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-4 ring-primary/10 transition-all outline-none text-lg tracking-widest"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 hover:shadow-xl hover:shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                {isRegistering ? 'Register & Continue' : 'Verify & Sign In'}
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex justify-between gap-3">
                                        {[...Array(6)].map((_, i) => (
                                            <input
                                                key={i}
                                                type="text"
                                                maxLength="1"
                                                value={otp[i] || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val) {
                                                        const newOtp = otp.split('');
                                                        newOtp[i] = val;
                                                        setOtp(newOtp.slice(0, 6).join(''));
                                                        if (i < 5) {
                                                            const next = e.target.nextElementSibling;
                                                            if (next) next.focus();
                                                        }
                                                    } else {
                                                        const newOtp = otp.split('');
                                                        newOtp[i] = '';
                                                        setOtp(newOtp.slice(0, 6).join(''));
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Backspace' && !otp[i] && i > 0) {
                                                        const prev = e.target.previousElementSibling;
                                                        if (prev) prev.focus();
                                                    }
                                                }}
                                                className="w-full aspect-square bg-slate-50 border-none rounded-xl text-center text-xl font-black text-slate-900 focus:ring-4 ring-primary/10 transition-all outline-none"
                                            />
                                        ))}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 hover:shadow-xl hover:shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Continue to Dashboard <ArrowRight size={18} /></>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep('phone')}
                                        className="w-full text-slate-400 font-bold text-xs hover:text-primary transition-colors"
                                    >
                                        Change Phone Number
                                    </button>
                                </div>
                            )}
                        </form>

                        <div id="recaptcha-container" className="mt-4"></div>

                        <div className="mt-10 pt-10 border-t border-slate-100 text-center">
                            <p className="text-sm font-bold text-slate-400">
                                {isRegistering
                                    ? "Already part of Sellsathi?"
                                    : "New here?"}
                                <button
                                    onClick={() => {
                                        setIsRegistering(!isRegistering);
                                        setError('');
                                    }}
                                    className="ml-2 text-primary hover:underline italic"
                                >
                                    {isRegistering ? 'Login Now' : 'Create an Account'}
                                </button>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
