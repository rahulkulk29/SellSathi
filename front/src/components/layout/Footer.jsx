import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SellerAuthModal from '../common/SellerAuthModal';

export default function Footer() {
    const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
    const [user, setUser] = useState(null);

    // Check localStorage on mount and listen for changes
    useEffect(() => {
        const checkUser = () => {
            const userData = localStorage.getItem('user');
            if (userData) {
                try {
                    setUser(JSON.parse(userData));
                } catch (error) {
                    console.error('Error parsing user data in footer:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        checkUser();

        const handleUserChange = () => {
            checkUser();
        };

        window.addEventListener('userDataChanged', handleUserChange);
        return () => {
            window.removeEventListener('userDataChanged', handleUserChange);
        };
    }, []);

    const handleBecomeSellerClick = () => {
        if (!user) {
            alert('Please login as a customer first before becoming a seller');
            return;
        }

        // Check if user is already a seller
        if (user.role === 'SELLER') {
            alert('You are already registered as a seller');
            return;
        }

        // Check if user is admin
        if (user.role === 'ADMIN') {
            alert('Admin cannot become a seller');
            return;
        }

        // Open seller registration modal
        setIsSellerModalOpen(true);
    };

    const handleSellerSuccess = () => {
        setIsSellerModalOpen(false);
        // Refresh user data is handled by the event listener
    };

    return (
        <footer className="glass-blur" style={{
            marginTop: '8rem',
            padding: '6rem 0 3rem 0',
            background: 'var(--surface)',
            borderTop: 'none',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.02)'
        }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '4rem'
                }}>
                    <div className="flex flex-col gap-6">
                        <Link to="/" style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.06em' }} className="gradient-text">
                            SELLSATHI
                        </Link>
                        <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '300px' }}> Empowering creators and small businesses through a premium global marketplace experience.</p>
                        <div className="flex gap-4">
                            {/* Social Placeholders if needed */}
                        </div>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Shop</h4>
                        <ul style={{ listStyle: 'none' }} className="flex flex-col gap-4">
                            <li><Link to="/products" className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>All Products</Link></li>
                            <li><Link to="/categories" className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>Featured Categories</Link></li>
                            <li><Link to="/track" className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>Order Tracking</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Company</h4>
                        <ul style={{ listStyle: 'none' }} className="flex flex-col gap-4">
                            <li><Link to="/faq" className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>Help Center</Link></li>
                            <li><Link to="/contact" className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>Contact Specialist</Link></li>
                            <li><Link to="/terms" className="text-muted" style={{ fontSize: '1rem', fontWeight: 500 }}>Privacy & Terms</Link></li>
                        </ul>
                    </div>

                    {user?.role !== 'SELLER' && (
                        <div className="glass-card" style={{ padding: '2rem', border: 'none', background: 'var(--primary-soft)', borderRadius: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 900 }}>Ready to grow?</h4>
                            <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>Join 50,000+ sellers worldwide who trust Sellsathi.</p>
                            <button
                                onClick={handleBecomeSellerClick}
                                className="btn btn-primary"
                                style={{ width: '100%', borderRadius: '1rem', padding: '1rem' }}
                            >
                                Get Started
                            </button>
                        </div>
                    )}
                </div>

                <div style={{
                    marginTop: '6rem',
                    paddingTop: '2rem',
                    borderTop: '1px solid var(--border)',
                    textAlign: 'center'
                }}>
                    <p className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 500 }}>&copy; 2026 SELLSATHI • Designed for the modern era.</p>
                </div>
            </div>

            <SellerAuthModal
                isOpen={isSellerModalOpen}
                onClose={() => setIsSellerModalOpen(false)}
                onSuccess={handleSellerSuccess}
            />
        </footer>
    );
}
