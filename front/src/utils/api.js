import { auth } from '../config/firebase';

const API_BASE = 'http://localhost:5000';

/**
 * Authenticated fetch wrapper.
 * 
 * HOW IT WORKS:
 * - If a real Firebase user is logged in → sends Authorization: Bearer <token>
 * - If using test login (no Firebase user) → sends X-Test-UID header from localStorage
 * - Falls back to plain fetch if neither exists
 * 
 * SWITCHING TO FIREBASE LATER:
 * When you enable real Firebase OTP, just remove the X-Test-UID fallback block.
 * The Bearer token path is already fully implemented.
 * 
 * @param {string} path - API path (e.g. '/admin/stats')
 * @param {object} options - Standard fetch options (method, body, etc.)
 * @returns {Promise<Response>}
 */
export async function authFetch(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Path 1: Real Firebase user (future production path)
    const currentUser = auth.currentUser;
    if (currentUser) {
        try {
            const idToken = await currentUser.getIdToken();
            headers['Authorization'] = `Bearer ${idToken}`;
        } catch (err) {
            console.warn('Failed to get Firebase token:', err.message);
        }
    } else {
        // Path 2: Test login mode — use stored test UID
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData?.uid) {
                headers['X-Test-UID'] = userData.uid;
            }
        } catch (err) {
            console.warn('Failed to read user from localStorage:', err.message);
        }
    }

    return fetch(url, {
        ...options,
        headers,
    });
}
