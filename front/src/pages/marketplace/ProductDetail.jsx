import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PRODUCTS } from '../../utils/mockData';
import { ShoppingCart, Heart, Shield, Truck, RotateCcw, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductDetail() {
    const { id } = useParams();
    const product = PRODUCTS.find(p => p.id === parseInt(id)) || PRODUCTS[0];
    
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [userFeedback, setUserFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        const user = localStorage.getItem('user');
        setIsLoggedIn(!!user);
        
        // Fetch reviews for this product
        fetchReviews();
    }, [id]);

    const fetchReviews = async () => {
        try {
            const response = await fetch(`http://localhost:5000/reviews/${id}`);
            const data = await response.json();
            
            if (data.success) {
                setReviews(data.reviews);
                
                // Calculate average rating
                if (data.reviews.length > 0) {
                    const sum = data.reviews.reduce((acc, review) => acc + review.rating, 0);
                    setAvgRating((sum / data.reviews.length).toFixed(1));
                }
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (!isLoggedIn) {
            alert('Please login to submit a review');
            return;
        }
        
        if (userRating === 0) {
            alert('Please select a rating');
            return;
        }
        
        if (!userFeedback.trim()) {
            alert('Please write your feedback');
            return;
        }

        setIsSubmitting(true);

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const idToken = await user.getIdToken();

            const response = await fetch('http://localhost:5000/reviews/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idToken,
                    reviewData: {
                        productId: id,
                        rating: userRating,
                        feedback: userFeedback
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Review submitted successfully!');
                setUserRating(0);
                setUserFeedback('');
                fetchReviews(); // Refresh reviews
            } else {
                alert('Failed to submit review: ' + data.message);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Error submitting review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = (rating, interactive = false, onStarClick = null) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={interactive ? 24 : 16}
                        fill={star <= rating ? '#FFD700' : 'none'}
                        stroke={star <= rating ? '#FFD700' : '#ccc'}
                        style={{ cursor: interactive ? 'pointer' : 'default' }}
                        onClick={() => interactive && onStarClick && onStarClick(star)}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '4rem 0' }}>
            <div className="flex gap-12">
                {/* Images */}
                <div style={{ flex: 1.2 }} className="flex flex-col gap-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card" style={{ padding: 0, overflow: 'hidden', height: '500px' }}
                    >
                        <img src={product.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </motion.div>
                    <div className="flex gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="glass-card" style={{ padding: 0, overflow: 'hidden', width: '100px', height: '100px', cursor: 'pointer' }}>
                                <img src={product.image} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1 }} className="flex flex-col gap-6">
                    <div>
                        <Link to="/products" className="text-muted" style={{ fontSize: '0.875rem' }}>&larr; Back to Shop</Link>
                        <h1 style={{ fontSize: '2.5rem', marginTop: '1rem' }}>{product.title}</h1>
                        <p className="text-muted">By <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{product.seller}</span></p>
                    </div>

                    <div style={{ padding: '2rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{product.price}</span>
                        <p className="text-muted" style={{ marginTop: '0.5rem' }}>Inclusive of all taxes</p>
                    </div>

                    <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>{product.description}</p>

                    <div className="flex gap-4">
                        <Link to="/checkout" className="btn btn-primary flex-1" style={{ padding: '1rem' }}>
                            <ShoppingCart size={20} /> Add to Cart
                        </Link>
                        <button className="btn btn-secondary" style={{ padding: '1rem' }}><Heart size={20} /></button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
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

                    <div className="glass-card" style={{ background: 'hsla(230, 85%, 60%, 0.05)', borderColor: 'hsla(230, 85%, 60%, 0.2)' }}>
                        <div className="flex gap-3">
                            <Shield size={20} color="var(--primary)" />
                            <div>
                                <h5>Seller Information</h5>
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>This seller is an active member of SELLSATHI and has completed over 500 successful orders.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="glass-card" style={{ marginTop: '4rem', padding: '2rem' }}>
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Customer Reviews</h2>
                    {reviews.length > 0 && (
                        <div className="flex items-center gap-3">
                            {renderStars(Math.round(avgRating))}
                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{avgRating}</span>
                            <span className="text-muted">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                        </div>
                    )}
                </div>

                {/* Review Submission Form */}
                {isLoggedIn ? (
                    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'var(--surface)' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Write a Review</h3>
                        <form onSubmit={handleSubmitReview}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Your Rating</label>
                                {renderStars(userRating, true, setUserRating)}
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Your Feedback</label>
                                <textarea
                                    value={userFeedback}
                                    onChange={(e) => setUserFeedback(e.target.value)}
                                    placeholder="Share your experience with this product..."
                                    style={{
                                        width: '100%',
                                        minHeight: '100px',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        fontSize: '1rem',
                                        resize: 'vertical'
                                    }}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                                style={{ padding: '0.75rem 2rem' }}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="glass-card text-center" style={{ padding: '2rem', marginBottom: '2rem', background: 'var(--surface)' }}>
                        <p className="text-muted">Please <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>login</Link> to write a review</p>
                    </div>
                )}

                {/* Reviews List */}
                <div className="flex flex-col gap-4">
                    {reviews.length === 0 ? (
                        <div className="text-center text-muted" style={{ padding: '2rem' }}>
                            <p>No reviews yet. Be the first to review this product!</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="glass-card" style={{ padding: '1.5rem' }}>
                                <div className="flex justify-between items-start" style={{ marginBottom: '0.75rem' }}>
                                    <div>
                                        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>{review.user}</h4>
                                        {renderStars(review.rating)}
                                    </div>
                                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>{review.date}</span>
                                </div>
                                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>{review.feedback}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
