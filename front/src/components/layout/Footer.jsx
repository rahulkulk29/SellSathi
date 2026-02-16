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
        <footer style={{
            marginTop: '10rem',
            padding: '8rem 0 4rem 0',
            background: '#ffffff',
            borderTop: '1px solid var(--border)',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.01)'
        }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '5rem'
                }}>
                    <div className="flex flex-col gap-6">
                        <Link to="/" style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.06em', color: 'var(--text)' }} className="gradient-text">
                            SELLSATHI
                        </Link>
                        <p style={{ fontSize: '1rem', lineHeight: 1.7, maxWidth: '320px', color: 'var(--text-muted)', fontWeight: 500 }}>
                            Empowering creators and small businesses through a premium global marketplace experience designed for the modern era.
                        </p>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '1.75rem', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text)' }}>Shop</h4>
                        <ul style={{ listStyle: 'none' }} className="flex flex-col gap-4">
                            <li><Link to="/products" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>All Products</Link></li>
                            <li><Link to="/categories" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>Featured Categories</Link></li>
                            <li><Link to="/track" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>Order Tracking</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '1.75rem', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text)' }}>Company</h4>
                        <ul style={{ listStyle: 'none' }} className="flex flex-col gap-4">
                            <li><Link to="/faq" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>Help Center</Link></li>
                            <li><Link to="/contact" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>Contact Specialist</Link></li>
                            <li><Link to="/terms" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>Privacy & Terms</Link></li>
                        </ul>
                    </div>

                    {user?.role !== 'SELLER' && (
                        <div className="glass-card" style={{ 
                            padding: '2.5rem', 
                            border: 'none', 
                            background: 'var(--primary-gradient)', 
                            borderRadius: '1.5rem',
                            boxShadow: 'var(--glow-shadow)',
                            color: 'white'
                        }}>
                            <h4 style={{ marginBottom: '0.75rem', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Ready to grow?</h4>
                            <p style={{ marginBottom: '1.75rem', fontSize: '0.95rem', fontWeight: 500, opacity: 0.9 }}>Join 50,000+ sellers worldwide who trust Sellsathi to scale their business.</p>
                            <button
                                onClick={handleBecomeSellerClick}
                                className="btn"
                                style={{ 
                                    width: '100%', 
                                    borderRadius: '1rem', 
                                    padding: '1rem',
                                    background: 'white',
                                    color: 'var(--primary)',
                                    fontWeight: 800,
                                    fontSize: '1rem',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            >
                                Get Started
                            </button>
                        </div>
                    )}
                </div>

                <div style={{
                    marginTop: '8rem',
                    paddingTop: '2.5rem',
                    borderTop: '1px solid var(--border)',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>&copy; 2026 SELLSATHI • Designed for visual excellence.</p>
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
