import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { 
    Filter, ShoppingCart, Star, SlidersHorizontal, Check, X, 
    Laptop, Shirt, Home as HomeIcon, Palette, Image, Hammer, Gem, LayoutGrid 
} from 'lucide-react';
import { seedProducts } from '../../utils/seedData';
import { addToCart } from '../../utils/cartUtils';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Filters State
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState(5000);
    const [sliderValue, setSliderValue] = useState(5000);
    const [visibleCount, setVisibleCount] = useState(8);
    const [sortBy, setSortBy] = useState('featured');

    const categoryIcons = {
        'All': <LayoutGrid size={18} />,
        'Electronics': <Laptop size={18} />,
        'Fashion': <Shirt size={18} />,
        'Home': <HomeIcon size={18} />,
        'Home Decor': <Palette size={18} />,
        'Wall Art': <Image size={18} />,
        'Woodcraft': <Hammer size={18} />,
        'Metal Craft': <Gem size={18} />
    };

    // Fetch & Seed Data
    useEffect(() => {
        const fetchData = async () => {
            await seedProducts();

            try {
                const response = await fetch('http://localhost:5000/marketplace/products');
                const data = await response.json();

                if (data.success && data.products.length > 0) {
                    const finalProducts = data.products;
                    setProducts(finalProducts);
                    setFilteredProducts(finalProducts);

                    const uniqueCategories = ['All', ...new Set(finalProducts.map(p => p.category))];
                    setCategories(uniqueCategories);
                } else {
                    // Fallback to Mock Data
                    const mockProducts = [
                        { id: 1, name: "Premium Wireless Headphones", price: 2999, category: "Electronics", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", seller: "Acoustics Pro" },
                        { id: 2, name: "Smart Fitness Watch", price: 1599, category: "Electronics", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", seller: "TechWear" },
                        { id: 3, name: "Minimalist Leather Backpack", price: 3500, category: "Fashion", imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500", seller: "Urban Gear" },
                        { id: 4, name: "Ergonomic Office Chair", price: 4999, category: "Home", imageUrl: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500", seller: "HomeStyle" },
                        { id: 5, name: "Organic Cotton T-Shirt", price: 799, category: "Fashion", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500", seller: "EcoFashion" },
                        { id: 6, name: "Smart Home Speaker", price: 2100, category: "Electronics", imageUrl: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=500", seller: "AudioStream" },
                        { id: 7, name: "Ceramic Coffee Set", price: 1200, category: "Home", imageUrl: "https://images.unsplash.com/photo-1517254456976-ee868207f219?w=500", seller: "ClayCraft" },
                        { id: 8, name: "Classic Polarized Sunglasses", price: 999, category: "Fashion", imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500", seller: "Optics Hub" }
                    ];
                    setProducts(mockProducts);
                    setFilteredProducts(mockProducts);
                    setCategories(['All', 'Electronics', 'Fashion', 'Home']);
                }

                setLoading(false);
            } catch (error) {
                console.warn("Backend unavailable, using mock data for UI testing.");
                const mockProducts = [
                    { id: 1, name: "Premium Wireless Headphones", price: 2999, category: "Electronics", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", seller: "Acoustics" },
                    { id: 2, name: "Smart Fitness Watch", price: 1599, category: "Electronics", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500" },
                    { id: 3, name: "Minimalist Leather Backpack", price: 3500, category: "Fashion", imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500" },
                    { id: 4, name: "Ergonomic Office Chair", price: 4999, category: "Home", imageUrl: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500" },
                    { id: 5, name: "Organic Cotton T-Shirt", price: 799, category: "Fashion", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500" },
                    { id: 6, name: "Smart Home Speaker", price: 2100, category: "Electronics", imageUrl: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=500" },
                    { id: 7, name: "Ceramic Coffee Set", price: 1200, category: "Home", imageUrl: "https://images.unsplash.com/photo-1517254456976-ee868207f219?w=500" },
                    { id: 8, name: "Classic Polarized Sunglasses", price: 999, category: "Fashion", imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500" }
                ];
                setProducts(mockProducts);
                setFilteredProducts(mockProducts);
                setCategories(['All', 'Electronics', 'Fashion', 'Home']);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search')?.toLowerCase() || '';

    // Filter Logic
    useEffect(() => {
        let result = [...products];

        if (searchQuery) {
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchQuery) ||
                product.description?.toLowerCase().includes(searchQuery) ||
                product.category.toLowerCase().includes(searchQuery)
            );
        }

        if (selectedCategory !== 'All') {
            result = result.filter(product => product.category === selectedCategory);
        }

        result = result.filter(product => product.price <= priceRange);

        if (sortBy === 'lowToHigh') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'highToLow') {
            result.sort((a, b) => b.price - a.price);
        }

        setFilteredProducts(result);
        setVisibleCount(8);
    }, [products, selectedCategory, priceRange, sortBy, searchQuery]);

    const handleAddToCart = async (product) => {
        const result = await addToCart(product);
        if (result.success) {
            alert(result.message);
        } else {
            alert(result.message);
        }
    };

    // Filter Component
    const FilterContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '2rem' }}>
                <Filter size={20} className="text-primary" />
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>Filters</h2>
            </div>

            {/* Categories */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ marginBottom: '1.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '800', opacity: 0.5 }}>Categories</h4>
                <div className="flex flex-col gap-1">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => {
                                setSelectedCategory(category);
                                if (window.innerWidth <= 768) setShowMobileFilters(false);
                            }}
                            className="btn"
                            style={{
                                justifyContent: 'flex-start',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.75rem',
                                background: selectedCategory === category ? 'var(--primary-soft)' : 'transparent',
                                color: selectedCategory === category ? 'var(--primary)' : 'var(--text-muted)',
                                fontWeight: selectedCategory === category ? '700' : '500',
                                gap: '12px',
                                boxShadow: 'none'
                            }}
                        >
                            <span style={{ opacity: selectedCategory === category ? 1 : 0.6 }}>{categoryIcons[category] || <LayoutGrid size={18} />}</span>
                            <span style={{ fontSize: '0.95rem' }}>{category}</span>
                            {selectedCategory === category && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Slider */}
            <div>
                <h4 style={{ marginBottom: '1.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '800', opacity: 0.5 }}>Price limit</h4>
                <div style={{ padding: '0 0.5rem' }}>
                    <input
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={sliderValue}
                        onChange={(e) => setSliderValue(Number(e.target.value))}
                        onMouseUp={() => setPriceRange(sliderValue)}
                        onTouchEnd={() => setPriceRange(sliderValue)}
                        className="price-slider"
                        style={{
                            background: `linear-gradient(to right, var(--primary) ${(sliderValue / 5000) * 100}%, var(--border) ${(sliderValue / 5000) * 100}%)`
                        }}
                    />
                    <div className="flex justify-between" style={{ marginTop: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹0</span>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--primary)', margin: 0 }}>₹{sliderValue}</p>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Max Price</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTop: '3px solid var(--primary)', borderRadius: '50%' }}></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ background: 'var(--background)' }}>
            <div className="container" style={{ padding: '3rem 1.5rem' }}>
                <div className="responsive-layout">

                    {/* Desktop/Tablet Sidebar */}
                    <aside className="desktop-only sticky-top" style={{ top: '100px' }}>
                        <div className="glass-card" style={{ padding: '2rem', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}>
                            <FilterContent />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main>
                        {/* Header Section */}
                        <div className="flex justify-between items-end flex-mobile-col" style={{ marginBottom: '3rem', gap: '1.5rem' }}>
                            <div>
                                <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', color: 'var(--text)', margin: 0 }}>
                                    All <span className="gradient-text">Products</span>
                                </h1>
                                <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>Explore premium results carefully curated for you.</p>
                            </div>

                            {/* Desktop Sort Dropdown */}
                            <div className="desktop-only">
                                <div className="glass-card" style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '999px', boxShadow: 'var(--shadow-sm)' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.5 }}>Sort by</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        style={{ border: 'none', background: 'transparent', fontWeight: 700, cursor: 'pointer', outline: 'none', fontSize: '0.9rem' }}
                                    >
                                        <option value="featured">Featured</option>
                                        <option value="lowToHigh">Price: Low to High</option>
                                        <option value="highToLow">Price: High to Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Controls Bar */}
                        <div className="mobile-only flex gap-4" style={{ marginBottom: '2rem' }}>
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="btn btn-secondary"
                                style={{ flex: 1, height: '56px', borderRadius: '1.25rem' }}
                            >
                                <SlidersHorizontal size={18} />
                                <span style={{ fontWeight: 700 }}>Filters</span>
                            </button>

                            <div className="glass-card flex items-center" style={{ flex: 1.5, padding: '0 1.25rem', height: '56px', borderRadius: '1.25rem' }}>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{ border: 'none', background: 'transparent', fontWeight: 700, width: '100%', outline: 'none', fontSize: '0.95rem' }}
                                >
                                    <option value="featured">Sort: Featured</option>
                                    <option value="lowToHigh">Price: Low to High</option>
                                    <option value="highToLow">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
                            gap: '2.5rem',
                            marginBottom: '4rem'
                        }}>
                            {filteredProducts.slice(0, visibleCount).map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover="hover"
                                    variants={{ hover: { y: -10 } }}
                                    className="glass-card"
                                    style={{ overflow: 'hidden', padding: 0, position: 'relative', border: 'none' }}
                                >
                                    <div style={{ position: 'relative', height: '320px', overflow: 'hidden' }}>
                                        <motion.img
                                            variants={{ hover: { scale: 1.1 } }}
                                            transition={{ duration: 0.6 }}
                                            src={product.imageUrl}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem' }}>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                fontWeight: 900,
                                                color: 'white',
                                                background: 'var(--primary)',
                                                padding: '6px 12px',
                                                borderRadius: '999px',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                            }}>{product.category}</span>
                                        </div>
                                        
                                        {/* Hover Add to Cart Overlay */}
                                        <motion.div 
                                            variants={{ hover: { opacity: 1, y: 0 } }}
                                            initial={{ opacity: 0, y: 20 }}
                                            style={{ 
                                                position: 'absolute', 
                                                bottom: '1rem', 
                                                left: '1rem', 
                                                right: '1rem',
                                                zIndex: 2
                                            }}
                                        >
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="btn btn-primary"
                                                style={{ width: '100%', borderRadius: '1rem', backdropFilter: 'blur(8px)' }}
                                            >
                                                <ShoppingCart size={18} /> Quick Add
                                            </button>
                                        </motion.div>
                                    </div>

                                    <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div className="flex justify-between items-start">
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', lineHeight: 1.2, margin: 0 }}>{product.name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                                                <Star size={14} fill="currentColor" />
                                                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text)' }}>4.8</span>
                                            </div>
                                        </div>

                                        <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>By <span style={{ fontWeight: 700, color: 'var(--text)' }}>{product.seller || "Trusted Seller"}</span></p>

                                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                            <span style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text)' }}>₹{product.price}</span>
                                            <span className="text-muted" style={{ fontSize: '0.9rem', textDecoration: 'line-through' }}>₹{Math.round(product.price * 1.25)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Load More */}
                        {visibleCount < filteredProducts.length && (
                            <div className="flex justify-center" style={{ marginBottom: '3rem' }}>
                                <button className="btn btn-secondary" onClick={() => setVisibleCount(v => v + 8)} style={{ padding: '1rem 3rem' }}>
                                    Load More Products
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Sidebar (Drawer) */}
            <AnimatePresence>
                {showMobileFilters && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mobile-only"
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            zIndex: 2000,
                            backdropFilter: 'blur(4px)'
                        }}
                        onClick={() => setShowMobileFilters(false)}
                    >
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                backgroundColor: 'var(--background)',
                                width: '85%',
                                maxWidth: '320px',
                                height: '100%',
                                padding: '2rem',
                                boxShadow: '10px 0 30px rgba(0,0,0,0.1)',
                                position: 'relative'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                style={{
                                    position: 'absolute',
                                    top: '1.5rem',
                                    right: '1.5rem',
                                    padding: '0.5rem',
                                    borderRadius: '50%',
                                    border: '1px solid var(--border)',
                                    background: 'var(--surface)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={20} />
                            </button>

                            <FilterContent />

                            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '1rem', borderRadius: '1rem' }}
                                >
                                    Apply & Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
