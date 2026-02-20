import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, ShoppingBag, TrendingUp, Gift, Bell } from 'lucide-react';
import { auth } from '../../config/firebase';

export default function NotificationPanel({ isOpen, onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && auth.currentUser) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // Fetch recent orders as notifications
            const res = await fetch(`http://localhost:5000/api/user/${auth.currentUser.uid}/orders`);
            const data = await res.json();
            
                if (data.success) {
                const orderNotifications = data.orders.slice(0, 5).map(order => ({
                    id: order.id,
                    type: 'order',
                    title: `Order ${order.status}`,
                    message: `Your order #${order.orderId || order.id.substring(0, 8)} is ${order.status.toLowerCase()}`,
                    time: order.createdAt || 'Recently',
                    icon: Package,
                    color: 'blue',
                    link: `/track?orderId=${order.orderId || order.id.substring(0, 8)}`
                }));

                // Add welcome notification
                const welcomeNotif = {
                id: 'welcome',
                type: 'info',
                title: 'Welcome to Sellsathi!',
                message: 'Explore thousands of products from verified sellers',
                time: 'Today',
                icon: Gift,
                color: 'purple',
                link: '/'
                };

                setNotifications([welcomeNotif, ...orderNotifications]);
            }
        } catch (err) {
            console.error("Notification Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const getIconColor = (color) => {
        const colors = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600',
            orange: 'bg-orange-50 text-orange-600'
        };
        return colors[color] || colors.blue;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-[100] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">Notifications</h2>
                                    <p className="text-xs text-gray-500 font-medium">{notifications.length} updates</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {loading ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all cursor-pointer group"
                                        onClick={() => {
                                            if (notif.link) {
                                                navigate(notif.link);
                                                onClose();
                                            }
                                        }}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(notif.color)}`}>
                                                <notif.icon size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                                                    {notif.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 font-medium line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-gray-400 font-bold mt-2">{notif.time}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-10">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <Bell size={32} className="text-gray-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">No notifications yet</h3>
                                    <p className="text-sm text-gray-500 font-medium">
                                        We'll notify you when something important happens
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <button className="w-full py-3 text-center text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors">
                                Mark all as read
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
