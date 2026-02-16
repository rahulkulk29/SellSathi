import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, ShoppingCart, Star, Heart, SlidersHorizontal, ChevronDown, Check, X } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
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

    // Fetch & Seed Data
    useEffect(() => {
        const fetchData = async () => {
            await seedProducts();

            try {
                const response = await fetch('http://localhost:5000/marketplace/products');
                const data = await response.json();

                if (data.success) {
                    const finalProducts = data.products;
                    setProducts(finalProducts);
                    setFilteredProducts(finalProducts);

                    const uniqueCategories = ['All', ...new Set(finalProducts.map(p => p.category))];
                    setCategories(uniqueCategories);
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching products:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search')?.toLowerCase() || '';

    // Filter Logic
    useEffect(() => {
        let result = products;

        if (searchQuery) {
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchQuery) ||
                product.description.toLowerCase().includes(searchQuery) ||
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

    // Filter Component (reusable for desktop and mobile)
    const FilterContent = () => (
        <>
            <div className="flex items-center gap-2" style={{ marginBottom: '2rem' }}>
                <Filter size={20} className="text-muted" />
                <h3 style={{ margin: 0 }}>Filters</h3>
            </div>

            {/* Categories */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>CATEGORIES</h4>
                <div className="flex flex-col gap-2">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => {
                                setSelectedCategory(category);
                                setShowMobileFilters(false);
                            }}
                            style={{
                                textAlign: 'left',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                background: selectedCategory === category ? 'var(--primary)' : 'transparent',
                                color: selectedCategory === category ? 'white' : 'var(--text-muted)',
                                fontWeight: selectedCategory === category ? '600' : '400',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                                fontSize: '0.95rem'
                            }}
                            onMouseEnter={(e) => selectedCategory !== category && (e.currentTarget.style.background = 'hsla(230, 85%, 60%, 0.1)')}
                            onMouseLeave={(e) => selectedCategory !== category && (e.currentTarget.style.background = 'transparent')}
                        >
                            {category}
                            {selectedCategory === category && <Check size={14} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Slider */}
            <div>
                <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>PRICE</h4>
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
                        style={{
                            background: `linear-gradient(to right, var(--primary) ${(sliderValue / 5000) * 100}%, var(--border) ${(sliderValue / 5000) * 100}%)`
                        }}
                        className="price-slider"
                    />
                    <div className="flex justify-between text-muted" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        <span>Min</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Up to ₹{sliderValue}</span>
                    </div>
                </div>
            </div>
        </>
    );

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
                <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTop: '3px solid var(--primary)', borderRadius: '50%' }}></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="container" style={{ padding: '2rem 1.5rem' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth > 768 ? '280px 1fr' : '1fr',
                    gap: '2rem'
                }}>

                    {/* Desktop Sidebar Filters */}
                    <aside className="desktop-only" style={{ height: 'fit-content', position: 'sticky', top: '100px' }}>
                        <div className="glass-card" style={{ padding: '2rem' }}>
                            <FilterContent />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main>
                        {/* Header */}
                        <div className="flex justify-between items-center flex-mobile-col" style={{ marginBottom: '2rem', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>All <span className="gradient-text">Products</span></h2>
                                <p className="text-muted">Showing {filteredProducts.length} results</p>
                            </div>

                            <div className="flex gap-2 items-center mobile-full-width">
                                {/* Mobile Filter Button */}
                                <button
                                    className="mobile-only btn btn-secondary"
                                    onClick={() => setShowMobileFilters(true)}
                                    style={{ flex: 1 }}
                                >
                                    <SlidersHorizontal size={18} />
                                    <span style={{ marginLeft: '0.5rem' }}>Filters</span>
                                </button>

                                {/* Sort Dropdown */}
                                <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                    <span className="text-muted desktop-only" style={{ fontSize: '0.875rem' }}>Sort:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        style={{ border: 'none', background: 'transparent', fontWeight: 600, cursor: 'pointer', width: '100%' }}
                                    >
                                        <option value="featured">Featured</option>
                                        <option value="lowToHigh">Price: Low to High</option>
                                        <option value="highToLow">Price: High to Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
                            gap: '1.5rem',
                            marginBottom: '3rem'
                        }}>
                            {filteredProducts.slice(0, visibleCount).map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    whileHover={{ y: -8 }}
                                    className="glass-card"
                                    style={{ overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}
                                >
                                    <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                    </div>

                                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div className="flex justify-between items-start" style={{ marginBottom: '0.5rem' }}>
                                            <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{product.category}</span>
                                            <div className="flex items-center gap-1" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                                <Star size={12} fill="var(--warning)" color="var(--warning)" />
                                                <span>4.8</span>
                                            </div>
                                        </div>

                                        <h3 style={{ fontSize: '1.1rem', marginBottom: 'auto', lineHeight: 1.4 }}>{product.name}</h3>

                                        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <span className="text-muted" style={{ fontSize: '0.8rem', textDecoration: 'line-through' }}>₹{Math.round(product.price * 1.2)}</span>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)' }}>
                                                    ₹{product.price}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="btn btn-primary"
                                                style={{ borderRadius: '50%', width: '42px', height: '42px', padding: 0 }}
                                                title="Add to Cart"
                                            >
                                                <ShoppingCart size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Load More Button */}
                        {visibleCount < filteredProducts.length && (
                            <div className="flex justify-center" style={{ marginBottom: '2rem' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setVisibleCount(prev => prev + 8)}
                                    style={{ padding: '0.75rem 2rem', minWidth: '150px' }}
                                >
                                    Load More
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filter Modal */}
            {showMobileFilters && (
                <div
                    className="mobile-only"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'flex-end'
                    }}
                    onClick={() => setShowMobileFilters(false)}
                >
                    <div
                        style={{
                            backgroundColor: 'var(--background)',
                            borderRadius: '1rem 1rem 0 0',
                            padding: '1.5rem',
                            width: '100%',
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Filters</h3>
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem', borderRadius: '50%' }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <FilterContent />
                        <button
                            onClick={() => setShowMobileFilters(false)}
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '1.5rem' }}
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
