import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, ShoppingCart, Star, Heart, SlidersHorizontal, ChevronDown, Check, Search } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { addToCart } from '../../utils/cartUtils';

export default function ProductListing() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();

    // Filters State
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sliderValue, setSliderValue] = useState(100000);
    const [sortBy, setSortBy] = useState('featured');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "products"));
                const productsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(productsData);
                setFilteredProducts(productsData);

                const uniqueCategories = ['All', ...new Set(productsData.map(p => p.category))];
                setCategories(uniqueCategories);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching products:", error);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const searchQuery = searchParams.get('search')?.toLowerCase() || '';

    useEffect(() => {
        let result = products;

        if (searchQuery) {
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchQuery) ||
                product.category.toLowerCase().includes(searchQuery)
            );
        }

        if (selectedCategory !== 'All') {
            result = result.filter(product => product.category === selectedCategory);
        }

        result = result.filter(product => product.price <= sliderValue);

        if (sortBy === 'lowToHigh') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'highToLow') {
            result.sort((a, b) => b.price - a.price);
        }

        setFilteredProducts(result);
    }, [products, selectedCategory, sliderValue, sortBy, searchQuery]);

    const handleAddToCart = async (product) => {
        try {
            const result = await addToCart(product);
            if (result.success) {
                alert("Product added to cart successfully!");
            } else {
                alert("Failed to add product to cart. Please try again.");
            }
        } catch (error) {
            console.error("Add to cart error:", error);
            alert("Failed to add product to cart. Please try again.");
        }
    };

    const handleAddToWishlist = async (product) => {
        if (!auth.currentUser) {
            alert("Please login to add to wishlist");
            return;
        }
        try {
            const res = await fetch(`http://localhost:5000/api/user/${auth.currentUser.uid}/wishlist/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product })
            });
            const data = await res.json();
            if (data.success) alert("Product added to wishlist!");
        } catch (err) {
            console.error("Wishlist Add Error:", err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50/30">
                <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in bg-gray-50/30 min-h-screen">
            <div className="container mx-auto p-8 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Sidebar Filters */}
                    <aside className="lg:col-span-3 space-y-8">
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 p-10 sticky top-24">
                            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-gray-50">
                                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                    <SlidersHorizontal size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Filters</h3>
                            </div>

                            {/* Categories */}
                            <div className="mb-10">
                                <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-wider mb-6 px-1">Categories</h4>
                                <div className="space-y-1">
                                    {categories.map(category => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all duration-200 ${selectedCategory === category
                                                ? 'bg-primary/5 text-primary font-bold shadow-sm'
                                                : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="text-sm">{category}</span>
                                            {selectedCategory === category && (
                                                <div className="w-2 h-2 bg-primary rounded-full" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort By Section */}
                            <div className="mb-10 pt-6 border-t border-gray-50">
                                <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-wider mb-6 px-1">Sort Results</h4>
                                <div className="space-y-2">
                                    {[
                                        { id: 'featured', label: 'Featured Selection' },
                                        { id: 'lowToHigh', label: 'Price: Low to High' },
                                        { id: 'highToLow', label: 'Price: High to Low' }
                                    ].map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => setSortBy(option.id)}
                                            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 border ${sortBy === option.id
                                                ? 'bg-primary/5 border-primary/20 text-primary font-bold shadow-sm'
                                                : 'bg-white border-transparent text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="text-sm">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price */}
                            <div className="pt-6 border-t border-gray-50">
                                <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-wider mb-6 px-1">Price Range</h4>
                                <div className="px-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100000"
                                        step="500"
                                        value={sliderValue}
                                        onChange={(e) => setSliderValue(Number(e.target.value))}
                                        className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-primary"
                                    />
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-xs font-bold text-gray-400">₹0</span>
                                        <span className="text-sm font-black text-primary bg-primary/5 px-3 py-1 rounded-lg">Up to ₹{sliderValue.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-9 space-y-8">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-200/20">
                            <div>
                                <h1 className="text-5xl font-black text-gray-900 tracking-tighter">
                                    Marketplace <span className="text-primary font-light underline decoration-primary/20 decoration-8 underline-offset-8">Explore</span>
                                </h1>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                            {filteredProducts.map((product) => {
                                const originalPrice = Math.round(product.price * 1.2);
                                const discount = 15; // Placeholder or calculate if data exists

                                return (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        whileHover={{ y: -8 }}
                                        className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden h-full flex flex-col"
                                    >
                                        <Link to={`/product/${product.id}`} className="flex flex-col h-full">
                                            {/* Image Container - Square & Structured */}
                                            <div className="relative aspect-square overflow-hidden bg-slate-50/50 p-6">
                                                <div className="w-full h-full bg-white rounded-2xl shadow-sm overflow-hidden flex items-center justify-center p-4">
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                </div>

                                                {/* Sale Badge */}
                                                <div className="absolute top-4 left-4">
                                                    <div className="bg-[#FF9900] text-white px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm">
                                                        {discount}% OFF
                                                    </div>
                                                </div>

                                                {/* Wishlist Button Overlay */}
                                                <div className="absolute top-4 right-4 z-10">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleAddToWishlist(product);
                                                        }}
                                                        className="w-10 h-10 bg-white/80 backdrop-blur-md shadow-md border border-white/50 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:scale-110 transition-all"
                                                    >
                                                        <Heart size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Content Area */}
                                            <div className="p-5 pt-0 flex-1 flex flex-col">
                                                <div className="mb-4">
                                                    <h3 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
                                                        {product.name}
                                                    </h3>

                                                    <div className="flex items-center gap-1 mt-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={12}
                                                                className={i < 4 ? 'text-[#FF9900] fill-[#FF9900]' : 'text-slate-200 fill-slate-200'}
                                                            />
                                                        ))}
                                                        <span className="text-[10px] font-bold text-slate-400 ml-1">(120)</span>
                                                    </div>
                                                </div>

                                                <div className="mt-auto">
                                                    <div className="flex items-baseline gap-2 mb-4">
                                                        <span className="text-xl font-black text-slate-900">₹{product.price.toLocaleString()}</span>
                                                        <span className="text-xs text-slate-400 font-bold line-through">₹{originalPrice.toLocaleString()}</span>
                                                    </div>

                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleAddToCart(product);
                                                        }}
                                                        className="w-full bg-[#4179EF] text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 hover:shadow-xl active:scale-95 transition-all"
                                                    >
                                                        Add to Cart
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Empty State */}
                        {filteredProducts.length === 0 && (
                            <div className="bg-white rounded-[3rem] p-20 border border-gray-100 shadow-sm text-center">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-50">
                                    <Search size={40} className="text-gray-300" />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 mb-4">No treasures found</h3>
                                <p className="text-gray-400 font-medium max-w-sm mx-auto mb-10">We couldn't find any products matching your filters. Try adjusting your search or explore other categories.</p>
                                <button
                                    onClick={() => { setSelectedCategory('All'); setSliderValue(100000); }}
                                    className="btn btn-primary px-10 py-4 rounded-3xl"
                                >
                                    Reset All Filters
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
