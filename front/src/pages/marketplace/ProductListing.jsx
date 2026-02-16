import { useState } from 'react';
import { PRODUCTS, CATEGORIES } from '../../utils/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Filter, Star, X, SlidersHorizontal, ShoppingCart, 
    Laptop, Shirt, Home as HomeIcon, Palette, Image, Hammer, Gem, LayoutGrid 
} from 'lucide-react';

export default function ProductListing() {
    const [showMobileFilters, setShowMobileFilters] = useState(false);

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

    // Reusable Filter Content
    const FilterContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div>
                <h4 style={{ marginBottom: '1.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '800', opacity: 0.5 }}>Categories</h4>
                <div className="flex flex-col gap-1">
                    {['All', ...CATEGORIES].map(cat => (
                        <label key={cat} className="flex items-center gap-3 cursor-pointer text-muted" style={{ 
                            fontSize: '0.95rem', 
                            padding: '0.65rem 1rem', 
                            borderRadius: '0.75rem',
                            transition: 'all 0.2s',
                            fontWeight: '500'
                        }}>
                            <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ opacity: 0.6 }}>{categoryIcons[cat] || <LayoutGrid size={16} />}</span>
                                {cat}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <h4 style={{ marginBottom: '1.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '800', opacity: 0.5 }}>Price limit</h4>
                <div style={{ padding: '0 0.5rem' }}>
                    <input type="range" min="0" max="5000" style={{ width: '100%' }} className="price-slider" />
                    <div className="flex justify-between" style={{ marginTop: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹0</span>
                        <span style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--primary)' }}>Up to ₹5000</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem', background: 'var(--background)' }}>
            {/* Header */}
            <div className="flex justify-between items-end flex-mobile-col" style={{ marginBottom: '3rem', gap: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', color: 'var(--text)', margin: 0 }}>
                        Marketplace <span className="gradient-text">Catalogue</span>
                    </h1>
                    <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>Explore premium results carefully curated from top sellers.</p>
                </div>

                {/* Mobile Filter Toggle */}
                <div className="mobile-only" style={{ width: '100%' }}>
                    <button 
                        className="btn btn-secondary flex items-center justify-center gap-3" 
                        onClick={() => setShowMobileFilters(true)}
                        style={{ width: '100%', height: '56px', borderRadius: '1.25rem' }}
                    >
                        <SlidersHorizontal size={18} />
                        <span style={{ fontWeight: 700 }}>Refine Search</span>
                    </button>
                </div>
            </div>

            <div className="responsive-layout">
                {/* Desktop/Tablet Sidebar Filters */}
                <aside className="desktop-only sticky-top" style={{ top: '100px' }}>
                    <div className="glass-card" style={{ padding: '2rem', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)' }}>
                        <div className="flex items-center gap-2" style={{ marginBottom: '2rem' }}>
                            <Filter size={20} className="text-primary" />
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>Filters</h2>
                        </div>
                        <FilterContent />
                    </div>
                </aside>

                {/* Product Grid */}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '2.5rem' }}>
                    {PRODUCTS.map(p => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover="hover"
                            variants={{ hover: { y: -10 } }}
                            className="glass-card"
                            style={{ overflow: 'hidden', padding: 0, position: 'relative', border: 'none' }}
                        >
                            <div style={{ position: 'relative', height: '320px', overflow: 'hidden' }}>
                                <motion.img 
                                    variants={{ hover: { scale: 1.1 } }}
                                    transition={{ duration: 0.6 }}
                                    src={p.image} 
                                    alt={p.title} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                                
                                {/* Status Badge */}
                                <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem' }}>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        fontWeight: 900,
                                        color: 'white',
                                        background: 'var(--primary)',
                                        padding: '6px 12px',
                                        borderRadius: '999px',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                    }}>NEW</span>
                                </div>

                                {/* Hover Overlay */}
                                <motion.div 
                                    variants={{ hover: { opacity: 1, y: 0 } }}
                                    initial={{ opacity: 0, y: 20 }}
                                    style={{ 
                                        position: 'absolute', 
                                        bottom: '1rem', 
                                        left: '1rem', 
                                        right: '1rem',
                                        zIndex: 2,
                                        display: 'flex',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Link to={`/product/${p.id}`} className="btn btn-secondary" style={{ flex: 1, borderRadius: '1rem', backdropFilter: 'blur(8px)', padding: '0.5rem' }}>
                                        Details
                                    </Link>
                                    <button className="btn btn-primary" style={{ flex: 1, borderRadius: '1rem', backdropFilter: 'blur(8px)', padding: '0.5rem' }}>
                                        <ShoppingCart size={18} /> Add
                                    </button>
                                </motion.div>
                            </div>

                            <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                <div className="flex justify-between items-start">
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', lineHeight: 1.2, margin: 0 }}>{p.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                                        <Star size={14} fill="currentColor" />
                                        <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text)' }}>4.8</span>
                                    </div>
                                </div>
                                <p className="text-muted" style={{ fontSize: '0.85rem' }}>By <span style={{ fontWeight: 700, color: 'var(--text)' }}>{p.seller}</span></p>
                                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                    <span style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text)' }}>₹{p.price}</span>
                                    <span className="text-muted" style={{ fontSize: '0.9rem', textDecoration: 'line-through' }}>₹{Math.round(p.price * 1.2)}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Mobile Sidebar Drawer */}
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
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                backgroundColor: 'var(--background)',
                                width: '85%',
                                maxWidth: '320px',
                                height: '100%',
                                padding: '2rem',
                                boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800' }}>Filters</h2>
                                <button 
                                    onClick={() => setShowMobileFilters(false)}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.4rem', borderRadius: '50%', width: '40px', height: '40px' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <FilterContent />

                            <button 
                                className="btn btn-primary" 
                                style={{ width: '100%', padding: '1.25rem', marginTop: 'auto', borderRadius: '1.25rem' }}
                                onClick={() => setShowMobileFilters(false)}
                            >
                                Apply Filters
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
