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
            marginTop: '4rem',
            padding: '4rem 0',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface)'
        }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    <div>
                        <h3 className="gradient-text" style={{ marginBottom: '1rem' }}>SELLSATHI</h3>
                        <p className="text-muted">The future of global marketplace. Fast, secure, and seller-friendly.</p>
                    </div>

                    <div>
                        <h4>Marketplace</h4>
                        <ul style={{ listStyle: 'none', marginTop: '1rem' }} className="flex flex-col gap-2">
                            <li><Link to="/products" className="text-muted">All Products</Link></li>
                            <li><Link to="/categories" className="text-muted">Categories</Link></li>
                            <li><Link to="/track" className="text-muted">Track Order</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4>Support</h4>
                        <ul style={{ listStyle: 'none', marginTop: '1rem' }} className="flex flex-col gap-2">
                            <li><Link to="/faq" className="text-muted">FAQ</Link></li>
                            <li><Link to="/contact" className="text-muted">Contact Us</Link></li>
                            <li><Link to="/terms" className="text-muted">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {user?.role !== 'SELLER' && (
                        <div style={{ marginTop: '1rem' }}>
                            <button
                                onClick={handleBecomeSellerClick}
                                className="btn btn-primary"
                                style={{ cursor: 'pointer' }}
                            >
                                Become a Seller
                            </button>
                            <p className="text-muted" style={{ marginTop: '0.5rem' }}>Open your shop in minutes.</p>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                    <p className="text-muted">&copy; 2026 SELLSATHI Inc. All rights reserved.</p>
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
