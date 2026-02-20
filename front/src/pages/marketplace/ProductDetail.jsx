<<<<<<< HEAD
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
=======
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart,
    Heart,
    Shield,
    Truck,
    RotateCcw,
    Star,
    ChevronRight,
    Share2,
    MapPin,
    AlertCircle,
    Info,
    CheckCircle2
} from 'lucide-react';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { addToCart } from '../../utils/cartUtils';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState(null);
    const [pincode, setPincode] = useState('');
    const [deliveryStatus, setDeliveryStatus] = useState(null);

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, "products", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() };
                    setProduct(data);

                    // Track recently viewed
                    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                    const updated = [data, ...recentlyViewed.filter(p => p.id !== data.id)].slice(0, 10);
                    localStorage.setItem('recentlyViewed', JSON.stringify(updated));

                    // Fetch related products from same category
                    const q = query(
                        collection(db, "products"),
                        where("category", "==", data.category),
                        limit(4)
                    );
                    const querySnapshot = await getDocs(q);
                    const related = querySnapshot.docs
                        .map(doc => ({ id: doc.id, ...doc.data() }))
                        .filter(p => p.id !== id);
                    setRelatedProducts(related);
                } else {
                    console.log("No such product!");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
        window.scrollTo(0, 0);
    }, [id]);

    const handleAddToCart = async () => {
        if (product) {
            const result = await addToCart(product);
            alert(result.message);
        }
    };

    const handleBuyNow = async () => {
        if (product) {
            await addToCart(product);
            navigate('/checkout');
        }
    };

    const checkDelivery = () => {
        if (pincode.length === 6) {
            setDeliveryStatus({
                success: true,
                message: 'Delivery available in 2-3 days',
                cod: true
            });
        } else {
            setDeliveryStatus({
                success: false,
                message: 'Please enter a valid 6-digit pincode'
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50/30">
                <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto p-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Product not found</h2>
                <Link to="/products" className="btn btn-primary">Back to Shop</Link>
            </div>
        );
    }

    const discount = Math.round(((product.price * 1.2 - product.price) / (product.price * 1.2)) * 100);
>>>>>>> lokesh

    return (
        <div className="animate-fade-in bg-gray-50/20 min-h-screen">
            {/* Breadcrumbs */}
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/products" className="hover:text-primary transition-colors">Shop</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-900 truncate">{product.name}</span>
                </div>
            </div>

<<<<<<< HEAD
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
=======
            <main className="container mx-auto px-4 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Image Gallery */}
                    <div className="lg:col-span-6 space-y-4">
                        <div className="flex flex-col gap-4">
                            {/* Main Image - Structured Case */}
                            <div className="relative rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-sm group">
                                <div className="aspect-[4/5] w-full bg-white flex items-center justify-center p-8">
                                    <motion.img
                                        key={selectedImage}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        src={product.imageUrl}
                                        className="w-full h-full object-contain"
                                        alt={product.name}
                                    />
                                </div>
                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    <button className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-sm border border-slate-100">
                                        <Heart size={18} />
                                    </button>
                                    <button className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-slate-400 hover:text-primary hover:bg-white transition-all shadow-sm border border-slate-100">
                                        <Share2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Thumbnails - Horizontal Row */}
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {[product.imageUrl, product.imageUrl, product.imageUrl].map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all p-1 bg-white shadow-sm ${selectedImage === idx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img} className="w-full h-full object-contain" alt="thumbnail" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Product Info */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-6">
                            {/* Title & Metadata */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="inline-flex px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                                        {product.category}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs bg-green-50 px-3 py-1 rounded-full">
                                        <CheckCircle2 size={12} />
                                        In Stock
                                    </div>
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <div className="flex text-[#FF9900]">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} className={i < 4 ? 'fill-current' : 'text-slate-200 fill-slate-200'} />
                                            ))}
                                        </div>
                                        <span className="text-sm font-black text-slate-900 ml-1">4.5</span>
                                    </div>
                                    <div className="h-4 w-px bg-slate-200" />
                                    <span className="text-xs font-bold text-slate-400">1,248 Ratings</span>
                                    <div className="h-4 w-px bg-slate-200" />
                                    <span className="text-xs font-bold text-slate-400">562 Reviews</span>
                                </div>
                                <p className="text-sm text-slate-500 font-medium">Sold by <span className="text-primary font-bold">Sellsathi Premium Store</span></p>
                            </div>

                            {/* Price Section */}
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <div>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-black text-slate-900">₹{product.price}</span>
                                        <span className="text-sm text-slate-400 font-bold line-through">₹{Math.round(product.price * 1.2)}</span>
                                        <span className="text-xs font-black text-green-600 bg-green-100 px-2 py-0.5 rounded-md uppercase">Save {discount}%</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1">Free Delivery on all orders above ₹499</p>
                                </div>
                            </div>

                            {/* Sizes */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Select Variant</h4>
                                    <button className="text-[10px] font-bold text-primary italic underline">View Guide</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {['Standard', 'Premium'].map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-6 py-3 rounded-xl font-bold text-xs transition-all border-2 ${selectedSize === size
                                                ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                                                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-white border-2 border-slate-900 text-slate-900 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                >
                                    <ShoppingCart size={18} />
                                    Add to Cart
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    className="flex-1 bg-[#4179EF] text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all hover:bg-blue-700 shadow-lg shadow-primary/20"
                                >
                                    Buy Package Now
                                </button>
                            </div>

                            {/* Trust Features */}
                            <div className="grid grid-cols-3 gap-2 pt-2">
                                <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                    <RotateCcw size={16} className="text-slate-400 mb-2" />
                                    <span className="text-[9px] font-black text-slate-900 uppercase tracking-tighter">7 Days Return</span>
                                </div>
                                <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                    <Truck size={16} className="text-slate-400 mb-2" />
                                    <span className="text-[9px] font-black text-slate-900 uppercase tracking-tighter">Fast Delivery</span>
                                </div>
                                <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                    <Shield size={16} className="text-slate-400 mb-2" />
                                    <span className="text-[9px] font-black text-slate-900 uppercase tracking-tighter">1 Year Warranty</span>
                                </div>
                            </div>

                            {/* Delivery Check */}
                            <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4 shadow-xl">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <MapPin size={12} className="text-primary" />
                                    Check Delivery Service
                                </h4>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        maxLength="6"
                                        placeholder="Enter Delivery Pincode"
                                        className="w-full bg-white/10 border-none rounded-2xl py-4 pl-6 pr-24 font-bold text-white placeholder:text-white/30 focus:ring-2 ring-primary/50 transition-all outline-none"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value)}
                                    />
                                    <button
                                        onClick={checkDelivery}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all"
                                    >
                                        Check
                                    </button>
                                </div>
                                {deliveryStatus && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex items-start gap-3 p-4 rounded-2xl ${deliveryStatus.success ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}
                                    >
                                        {deliveryStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                        <div className="flex-1">
                                            <p className="text-xs font-bold">{deliveryStatus.message}</p>
                                            {deliveryStatus.cod && (
                                                <p className="text-[10px] opacity-70 mt-1 font-medium">Cash on Delivery Available</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Description */}
                <section className="mt-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-10 space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                        <div className="w-1.5 h-8 bg-primary rounded-full" />
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Product Specifications</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <p className="text-slate-600 font-medium leading-[1.8] text-lg">
                                {product.description}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Category', value: product.category, icon: Info },
                                { label: 'Material', value: 'Premium Blend', icon: Info },
                                { label: 'Wash Care', value: 'Machine Wash', icon: Info },
                                { label: 'Origin', value: 'India', icon: Info }
                            ].map((spec, i) => (
                                <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50 space-y-2 group hover:bg-white hover:shadow-md transition-all">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{spec.label}</span>
                                    <p className="text-slate-900 font-bold">{spec.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Similar Products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-16 space-y-10">
                        <div className="flex justify-between items-end px-2">
                            <div className="space-y-2">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Similar <span className="text-[#4179EF]">Picks</span></h2>
                                <p className="text-slate-500 font-medium italic">Handpicked alternatives for your current choice</p>
                            </div>
                            <Link to="/products" className="text-sm font-black text-primary hover:underline flex items-center gap-2">
                                Explore All <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(p => (
                                <Link
                                    to={`/product/${p.id}`}
                                    key={p.id}
                                    className="group bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col h-full"
                                >
                                    <div className="relative aspect-square overflow-hidden bg-slate-50/50 p-4">
                                        <div className="w-full h-full bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center p-3">
                                            <img src={p.imageUrl} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                                        </div>
                                    </div>
                                    <div className="p-5 space-y-3 flex-1 flex flex-col">
                                        <h3 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[2rem]">
                                            {p.name}
                                        </h3>
                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="text-lg font-black text-slate-900">₹{p.price.toLocaleString()}</span>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                                                <Star size={10} fill="currentColor" />
                                                <span>4.8</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>
>>>>>>> lokesh
        </div>
    );
}
