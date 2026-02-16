import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut, ChevronDown, LayoutDashboard, Menu, X } from 'lucide-react';
import AuthModal from '../common/AuthModal';

export default function Navbar() {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Check localStorage on mount and listen for changes
    useEffect(() => {
        const checkUser = () => {
            const userData = localStorage.getItem('user');
            if (userData) {
                try {
                    setUser(JSON.parse(userData));
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        checkUser();

        // Listen for userDataChanged event
        const handleUserChange = () => {
            checkUser();
        };

        window.addEventListener('userDataChanged', handleUserChange);

        return () => {
            window.removeEventListener('userDataChanged', handleUserChange);
        };
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('user');
        setUser(null);
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
        window.dispatchEvent(new CustomEvent('userDataChanged'));
        navigate('/');
    };

    const handleLoginSuccess = () => {
        setIsLoginModalOpen(false);
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
        // User data will be updated via the userDataChanged event listener
    };

    return (
        <>
            <nav className="glass-blur" style={{
                margin: '0',
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: '0',
                zIndex: 1000,
                height: '80px'
            }}>
                <Link to="/" style={{ fontSize: '1.75rem', fontWeight: '900', letterSpacing: '-0.05em' }} className="gradient-text">
                    SELLSATHI
                </Link>
                
                {/* Desktop Search - Only on home page */}
                {location.pathname === '/' && (
                    <div className="desktop-only flex items-center" style={{ flex: 1, maxWidth: '500px', margin: '0 2rem' }}>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                            <input
                                type="text"
                                placeholder="Search for unique items..."
                                onChange={(e) => {
                                    const params = new URLSearchParams(window.location.search);
                                    if (e.target.value) {
                                        params.set('search', e.target.value);
                                    } else {
                                        params.delete('search');
                                    }
                                    navigate(`/?${params.toString()}`);
                                }}
                                style={{ 
                                    paddingLeft: '3rem', 
                                    width: '100%', 
                                    height: '48px', 
                                    borderRadius: '999px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--background)',
                                    boxShadow: 'var(--shadow-sm)',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Desktop Navigation */}
                <div className="desktop-only">
                    <div className="flex gap-4 items-center">
                        <Link to="/checkout" className="btn btn-secondary" style={{ borderRadius: '999px', width: '48px', height: '48px', padding: 0 }}>
                            <ShoppingCart size={20} />
                        </Link>

                        {(user?.role === 'SELLER' || user?.role === 'ADMIN') &&
                            !location.pathname.startsWith(user.role === 'ADMIN' ? '/admin' : '/seller/dashboard') && (
                                <Link
                                    to={user.role === 'ADMIN' ? "/admin" : "/seller/dashboard"}
                                    className="btn btn-primary"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.65rem 1.25rem',
                                        borderRadius: '999px',
                                        height: '48px'
                                    }}
                                >
                                    <LayoutDashboard size={18} />
                                    <span>Dashboard</span>
                                </Link>
                            )}

                        {user ? (
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="btn btn-secondary"
                                    style={{ 
                                        gap: '12px', 
                                        borderRadius: '999px',
                                        padding: '0 0.5rem 0 1.25rem',
                                        height: '48px'
                                    }}
                                >
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Account</span>
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    background: 'var(--primary)', 
                                    color: 'white', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <User size={16} />
                                </div>
                                <ChevronDown size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
                            </button>

                            {isProfileOpen && (
                                <div
                                    className="glass-card animate-fade-in"
                                    style={{
                                        position: 'absolute',
                                        top: '120%',
                                        right: 0,
                                        minWidth: '280px',
                                        padding: '0.75rem',
                                        zIndex: 1001,
                                        overflow: 'hidden'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Profile Header */}
                                    <div style={{
                                        padding: '1.25rem',
                                        borderBottom: '1px solid var(--border)',
                                        background: 'var(--primary-soft)',
                                        borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '50%',
                                                background: 'var(--primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                boxShadow: '0 4px 10px hsla(230, 85%, 60%, 0.3)'
                                            }}>
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', margin: 0, textTransform: 'uppercase' }}>{user.role}</p>
                                                <p style={{ fontSize: '1rem', fontWeight: '800', margin: '2px 0 0 0' }}>{user.phone}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Actions */}
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => {
                                                setIsLoginModalOpen(true);
                                                setIsProfileOpen(false);
                                            }}
                                            className="btn btn-secondary"
                                            style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: 'transparent', boxShadow: 'none' }}
                                        >
                                            <User size={18} />
                                            <span>Switch Account</span>
                                        </button>

                                        <button
                                            onClick={handleSignOut}
                                            className="btn btn-secondary"
                                            style={{ 
                                                width: '100%', 
                                                justifyContent: 'flex-start', 
                                                border: 'none', 
                                                background: 'transparent', 
                                                boxShadow: 'none',
                                                color: 'var(--error)' 
                                            }}
                                        >
                                            <LogOut size={18} />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsLoginModalOpen(true)}
                            className="btn btn-primary"
                            style={{ borderRadius: '999px', padding: '0.65rem 1.5rem' }}
                        >
                            <User size={18} />
                            <span>Login</span>
                        </button>
                    )}
                </div>
            </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-only btn btn-secondary icon-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{ borderRadius: '999px', width: '48px', height: '48px', padding: 0 }}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="mobile-only"
                    style={{
                        position: 'fixed',
                        top: '5rem',
                        left: '1rem',
                        right: '1rem',
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '1rem',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                        zIndex: 999,
                        padding: '1rem',
                        maxHeight: 'calc(100vh - 7rem)',
                        overflowY: 'auto'
                    }}
                >
                    {/* Mobile Search */}
                    {location.pathname === '/' && (
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    onChange={(e) => {
                                        const params = new URLSearchParams(window.location.search);
                                        if (e.target.value) {
                                            params.set('search', e.target.value);
                                        } else {
                                            params.delete('search');
                                        }
                                        navigate(`/?${params.toString()}`);
                                    }}
                                    style={{ paddingLeft: '2.5rem', width: '100%', height: '40px' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Mobile Navigation Links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Link
                            to="/checkout"
                            className="btn btn-secondary"
                            style={{ width: '100%', justifyContent: 'flex-start' }}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <ShoppingCart size={20} />
                            <span style={{ marginLeft: '0.5rem' }}>Cart</span>
                        </Link>

                        {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
                            <Link
                                to={user.role === 'ADMIN' ? "/admin" : "/seller/dashboard"}
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'flex-start' }}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <LayoutDashboard size={20} />
                                <span style={{ marginLeft: '0.5rem' }}>Dashboard</span>
                            </Link>
                        )}

                        {user ? (
                            <>
                                <div style={{
                                    padding: '1rem',
                                    backgroundColor: 'hsla(230, 85%, 60%, 0.05)',
                                    borderRadius: '0.5rem',
                                    marginTop: '0.5rem'
                                }}>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Logged in as</p>
                                    <p style={{ fontSize: '1rem', fontWeight: 'bold', margin: '4px 0' }}>{user.phone}</p>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '4px 8px',
                                        backgroundColor: 'var(--primary)',
                                        color: 'white',
                                        borderRadius: '4px',
                                        textTransform: 'capitalize'
                                    }}>
                                        {user.role}
                                    </span>
                                </div>

                                <button
                                    onClick={() => {
                                        setIsLoginModalOpen(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="btn btn-secondary"
                                    style={{ width: '100%', justifyContent: 'flex-start' }}
                                >
                                    <User size={20} />
                                    <span style={{ marginLeft: '0.5rem' }}>Switch User</span>
                                </button>

                                <button
                                    onClick={handleSignOut}
                                    className="btn btn-secondary"
                                    style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--danger, #ff6b6b)' }}
                                >
                                    <LogOut size={20} />
                                    <span style={{ marginLeft: '0.5rem' }}>Sign Out</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    setIsLoginModalOpen(true);
                                    setIsMobileMenuOpen(false);
                                }}
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'flex-start' }}
                            >
                                <User size={20} />
                                <span style={{ marginLeft: '0.5rem' }}>Login</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            <AuthModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSuccess={handleLoginSuccess}
            />
        </>
    );
}
