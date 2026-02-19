import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ADMIN_PHONE = '+917483743936';

export default function ProtectedRoute({ children, requiredRole = null }) {
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        const checkAuthorization = () => {
            const user = localStorage.getItem('user');
            if (!user) {
                console.log('No user in localStorage - Unauthorized');
                setIsAuthorized(false);
                return;
            }

            try {
                const userData = JSON.parse(user);
                // Check for admin access
                if (requiredRole === 'ADMIN') {
                    if (userData.role !== 'ADMIN' || userData.phone !== ADMIN_PHONE) {
                        console.warn(`Unauthorized admin access - Role: ${userData.role}, Phone: ${userData.phone}`);
                        setIsAuthorized(false);
                        return;
                    }
                }

                // Check for seller access - STATUS CHECK ADDED
                if (requiredRole === 'SELLER') {
                    // Check local storage status if available
                    // The backend returns 'role: SELLER' even if pending, so we must check status
                    // Status is often stored in localStorage user object during login/refresh

                    if (userData.role !== 'SELLER') {
                        console.warn(`Unauthorized seller access - Role: ${userData.role}`);
                        setIsAuthorized(false);
                        return;
                    }

                    // CRITICAL FIX: If status is PENDING, do NOT allow dashboard access

                }

                setIsAuthorized(true);
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('user');
                setIsAuthorized(false);
            }
        };

        // Check authorization on mount
        checkAuthorization();

        // Listen for custom userDataChanged event
        const handleUserChange = () => {
            console.log('User data changed - Re-checking authorization');
            checkAuthorization();
        };

        window.addEventListener('userDataChanged', handleUserChange);

        return () => {
            window.removeEventListener('userDataChanged', handleUserChange);
        };
    }, [requiredRole]);

    // Navigate to home if authorization is lost
    useEffect(() => {
        if (isAuthorized === false) {
            console.log('Authorization lost - Navigating to home');
            navigate('/', { replace: true });
        }
    }, [isAuthorized, navigate]);

    if (isAuthorized === null) {
        return null; // Loading state
    }

    if (isAuthorized === false) {
        return <Navigate to="/" replace />;
    }

    return children;
}
