import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Tag, ShoppingBag, ShieldCheck } from 'lucide-react';

const Home = () => {
  const { authFetch, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [college, setCollege] = useState('All');

  const categories = ['All', 'Books', 'Electronics', 'Clothing', 'Dorm & Housing', 'Sports & Outdoors', 'Other'];
  
  const colleges = [
    'All',
    'Stanford University',
    'Massachusetts Institute of Technology',
    'UC Berkeley',
    'Harvard University',
    'UT Austin',
    'New York University',
    'University of Michigan'
  ];

  // Helper to determine badge color for item condition
  const getConditionBadge = (condition) => {
    switch (condition) {
      case 'New': return <span className="badge badge-new">New</span>;
      case 'Like New': return <span className="badge badge-like-new">Like New</span>;
      case 'Good': return <span className="badge badge-good">Good</span>;
      case 'Fair': return <span className="badge badge-fair">Fair</span>;
      default: return null;
    }
  };

  // Helper to check if user has verified student email (.edu)
  const isEmailVerified = (email = '') => {
    return email.toLowerCase().endsWith('.edu');
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (college !== 'All') params.append('college', college);
      if (search) params.append('search', search);
      
      const response = await authFetch(`/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, college]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="fade-in">
      {/* Hero Header Section */}
      <header style={{ 
        textAlign: 'center', 
        padding: '40px 20px 60px 20px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative'
      }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #fff 20%, #a78bfa 60%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px',
          lineHeight: 1.1
        }}>
          Campus Trading Made Simple
        </h1>
        <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px', marginBottom: '32px' }}>
          Buy and sell books, dorm furniture, study gear, and clothes locally with other verified students at your campus.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{
          display: 'flex',
          width: '100%',
          maxWidth: '650px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border)',
          borderRadius: '9999px',
          padding: '6px 6px 6px 18px',
          alignItems: 'center',
          boxShadow: 'var(--shadow-md)',
          gap: '8px',
          backdropFilter: 'blur(8px)'
        }}>
          <Search size={20} className="text-muted" />
          <input
            type="text"
            className="form-input"
            style={{ border: 'none', background: 'transparent', flex: 1, padding: '8px 0', outline: 'none', boxShadow: 'none' }}
            placeholder="Search textbook name, desk chair, bike..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ borderRadius: '9999px', padding: '10px 24px' }}>
            Find Deals
          </button>
        </form>
      </header>

      {/* Filters Toolbar */}
      <div className="glass-card" style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '20px', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '16px 24px',
        marginBottom: '40px',
        borderRadius: 'var(--radius-sm)'
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flex: 1 }}>
          {/* Category Filter */}
          <div className="flex align-center gap-2" style={{ minWidth: '200px' }}>
            <Tag size={16} className="text-muted" />
            <select 
              className="form-select" 
              style={{ padding: '8px 12px' }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat} style={{ backgroundColor: 'var(--bg-deep)' }}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Campus Filter */}
          <div className="flex align-center gap-2" style={{ minWidth: '200px' }}>
            <MapPin size={16} className="text-muted" />
            <select 
              className="form-select" 
              style={{ padding: '8px 12px' }}
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            >
              {colleges.map((col, idx) => (
                <option key={idx} value={col} style={{ backgroundColor: 'var(--bg-deep)' }}>{col}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-muted" style={{ fontSize: '0.9rem' }}>
          Showing <strong>{products.length}</strong> active listings
        </div>
      </div>

      {/* Grid of Listings */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div className="form-label" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>Scanning campus for deals...</div>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card" style={{ padding: '80px 40px', textAlign: 'center' }}>
          <ShoppingBag size={48} className="text-muted" style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3>No Listings Found</h3>
          <p className="text-muted mt-4">Try adjusting your filters, searching for something else, or be the first to sell!</p>
          <Link to="/sell" className="btn btn-primary mt-4" style={{ display: 'inline-flex' }}>
            List your item
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <Link key={product._id} to={`/products/${product._id}`} className="glass-card" style={{ 
              padding: 0, 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden', 
              borderRadius: 'var(--radius-md)'
            }}>
              {/* Product Image */}
              <div style={{ 
                height: '200px', 
                width: '100%', 
                background: product.image ? `url(${product.image}) center/cover no-repeat` : 'linear-gradient(135deg, var(--bg-deep) 0%, var(--primary-glow) 100%)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {!product.image && (
                  <ShoppingBag size={40} className="text-muted" style={{ opacity: 0.3 }} />
                )}
                <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                  {getConditionBadge(product.condition)}
                </div>
                
                {product.status === 'sold' && (
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    fontSize: '1.5rem',
                    color: 'var(--text-dark)'
                  }}>
                    SOLD
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
                <div className="flex justify-between align-center">
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {product.category}
                  </span>
                  <span style={{ 
                    fontFamily: 'var(--font-heading)', 
                    fontWeight: 800, 
                    fontSize: '1.25rem', 
                    color: 'var(--text-main)' 
                  }}>
                    ${product.price}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.15rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.title}
                </h4>

                <p className="text-muted" style={{ 
                  fontSize: '0.85rem', 
                  display: '-webkit-box', 
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  flex: 1
                }}>
                  {product.description}
                </p>

                {/* Campus & Seller Location footer */}
                <div className="flex align-center gap-2" style={{ 
                  marginTop: '12px', 
                  paddingTop: '12px', 
                  borderTop: '1px solid var(--border)', 
                  fontSize: '0.8rem', 
                  color: 'var(--text-muted)' 
                }}>
                  <MapPin size={12} style={{ color: 'var(--primary)' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.college}
                  </span>
                </div>

                {/* Seller verification display */}
                {product.seller && (
                  <div className="flex align-center justify-between" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                    <div className="flex align-center gap-2">
                      <img 
                        src={product.seller.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${product.seller.name}`} 
                        alt={product.seller.name} 
                        style={{ width: '18px', height: '18px', borderRadius: '50%' }} 
                      />
                      <span className="text-muted">{product.seller.name}</span>
                    </div>
                    {isEmailVerified(product.seller.email) && (
                      <span className="badge badge-verified" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                        <ShieldCheck size={10} style={{ marginRight: '2px' }} /> Verified
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
