import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Shield, Truck, RotateCcw, Star, Loader, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { auth } from '../../config/firebase';

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewForm, setReviewForm] = useState({ rating: 5, feedback: '' });
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(u => setUser(u));
        fetchProductData();
        return () => unsubscribe();
    }, [id]);

    const fetchProductData = async () => {
        try {
            setLoading(true);
            // Fetch Product
            const prodRes = await fetch(`http://localhost:5000/product/${id}`);
            const prodData = await prodRes.json();
            if (prodData.success) {
                setProduct(prodData.product);
            }

            // Fetch Reviews
            const revRes = await fetch(`http://localhost:5000/reviews/${id}`);
            const revData = await revRes.json();
            if (revData.success) {
                setReviews(revData.reviews);
            }
        } catch (error) {
            console.error("Error fetching product data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("Please login to submit a review");
            return;
        }

        try {
            setSubmitting(true);
            const idToken = await user.getIdToken();
            const response = await fetch('http://localhost:5000/reviews/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idToken,
                    productId: id,
                    rating: reviewForm.rating,
                    feedback: reviewForm.feedback
                })
            });
            const data = await response.json();
            if (data.success) {
                alert("Review submitted successfully!");
                setReviewForm({ rating: 5, feedback: '' });
                fetchProductData(); // Refresh reviews
            } else {
                alert("Failed to submit review: " + data.message);
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Error submitting review");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader className="animate-spin" /></div>;
    if (!product) return <div className="text-center p-20">Product not found</div>;

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "No ratings yet";

    return (
        <div className="container animate-fade-in" style={{ padding: '4rem 0' }}>
            <div className="flex gap-12" style={{ marginBottom: '4rem' }}>
                {/* Images */}
                <div style={{ flex: 1.2 }} className="flex flex-col gap-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card" style={{ padding: 0, overflow: 'hidden', height: '500px' }}
                    >
                        <img src={product.image || 'https://via.placeholder.com/500'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </motion.div>
                </div>

                {/* Info */}
                <div style={{ flex: 1 }} className="flex flex-col gap-6">
                    <div>
                        <Link to="/products" className="text-muted" style={{ fontSize: '0.875rem' }}>&larr; Back to Shop</Link>
                        <h1 style={{ fontSize: '2.5rem', marginTop: '1rem' }}>{product.title}</h1>
                        <p className="text-muted">By <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{product.seller}</span></p>

                        <div className="flex items-center gap-2" style={{ marginTop: '0.5rem' }}>
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill={i < Math.round(Number(averageRating) || 0) ? "currentColor" : "none"} />
                                ))}
                            </div>
                            <span className="text-muted text-sm">({reviews.length} reviews)</span>
                        </div>
                    </div>

                    <div style={{ padding: '2rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{product.price}</span>
                        <p className="text-muted" style={{ marginTop: '0.5rem' }}>Inclusive of all taxes</p>
                    </div>

                    <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>{product.description || "No description available."}</p>

                    <div className="flex gap-4">
                        <Link to="/checkout" className="btn btn-primary flex-1" style={{ padding: '1rem' }}>
                            <ShoppingCart size={20} /> Add to Cart
                        </Link>
                        <button className="btn btn-secondary" style={{ padding: '1rem' }}><Heart size={20} /></button>
                    </div>

                    {/* Policies */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div className="glass-card flex items-center gap-3" style={{ padding: '1rem' }}>
                            <Truck size={20} className="text-muted" />
                            <div>
                                <h5 style={{ fontSize: '0.875rem' }}>Free Delivery</h5>
                                <p style={{ fontSize: '0.75rem' }} className="text-muted">Orders over ₹500</p>
                            </div>
                        </div>
                        <div className="glass-card flex items-center gap-3" style={{ padding: '1rem' }}>
                            <RotateCcw size={20} className="text-muted" />
                            <div>
                                <h5 style={{ fontSize: '0.875rem' }}>7 Days Return</h5>
                                <p style={{ fontSize: '0.75rem' }} className="text-muted">Easy returns & refunds</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Customer Reviews</h3>

                <div className="flex gap-12 flex-col md:flex-row">
                    {/* Review Form */}
                    <div style={{ flex: 1 }}>
                        <h4 style={{ marginBottom: '1rem' }}>Write a Review</h4>
                        <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                        >
                                            <Star
                                                size={24}
                                                fill={star <= reviewForm.rating ? "#FBBF24" : "none"}
                                                color={star <= reviewForm.rating ? "#FBBF24" : "currentColor"}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm mb-2">Your Feedback</label>
                                <textarea
                                    className="input"
                                    rows="4"
                                    placeholder="Tell us what you liked or didn't like..."
                                    value={reviewForm.feedback}
                                    onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '1rem', background: 'var(--background)' }}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting || !user}
                                style={{ alignSelf: 'flex-start' }}
                            >
                                {submitting ? "Submitting..." : (user ? "Submit Review" : "Login to Review")}
                            </button>
                        </form>
                    </div>

                    {/* Reviews List */}
                    <div style={{ flex: 1.5 }}>
                        <h4 style={{ marginBottom: '1rem' }}>Recent Reviews</h4>
                        <div className="flex flex-col gap-4">
                            {reviews.length === 0 ? (
                                <p className="text-muted">No reviews yet. Be the first to review!</p>
                            ) : (
                                reviews.map(review => (
                                    <div key={review.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{review.userName || 'User'}</p>
                                                    <div className="flex text-yellow-500" style={{ fontSize: '0.75rem' }}>
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                {review.createdAt ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{review.feedback}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
