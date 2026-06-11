import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, CheckCircle, Mail, MapPin, Calendar, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { authFetch, user } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'sold'

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const response = await authFetch('/products');
      if (response.ok) {
        const data = await response.json();
        // Filter products belonging to current user
        const myListings = data.filter(p => {
          const sellerId = p.seller._id ? p.seller._id.toString() : p.seller.toString();
          return sellerId === user._id;
        });
        setProducts(myListings);
      }
    } catch (error) {
      console.error('Failed to load user listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const activeListings = products.filter(p => p.status !== 'sold');
  const soldListings = products.filter(p => p.status === 'sold');

  const visibleProducts = activeTab === 'active' ? activeListings : soldListings;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Top Banner / User Credentials */}
      <div className="glass-card" style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '30px', 
        padding: '40px',
        borderRadius: 'var(--radius-lg)',
        alignItems: 'center'
      }}>
        <img 
          src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`} 
          alt={user.name} 
          style={{ 
            width: '100px', 
            height: '100px', 
            borderRadius: '50%', 
            border: '3px solid var(--primary)',
            background: 'var(--bg-deep)'
          }} 
        />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '2.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user.name}
            {user.email.toLowerCase().endsWith('.edu') && (
              <span className="badge badge-verified" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                <ShieldCheck size={12} style={{ marginRight: '4px' }} /> Verified Student
              </span>
            )}
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '16px', color: 'var(--text-muted)' }}>
            <div className="flex align-center gap-2">
              <Mail size={16} style={{ color: 'var(--primary)' }} />
              <span>{user.email}</span>
            </div>
            
            <div className="flex align-center gap-2">
              <MapPin size={16} style={{ color: 'var(--secondary)' }} />
              <span>{user.college}</span>
            </div>

            {user.createdAt && (
              <div className="flex align-center gap-2">
                <Calendar size={16} style={{ color: 'var(--accent)' }} />
                <span>Joined {new Date(user.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' })}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div>
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--border)', 
          marginBottom: '30px',
          gap: '24px'
        }}>
          <button 
            onClick={() => setActiveTab('active')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'active' ? '#fff' : 'var(--text-muted)',
              fontSize: '1.1rem',
              fontWeight: 600,
              padding: '12px 6px',
              cursor: 'pointer',
              position: 'relative',
              outline: 'none',
              fontFamily: 'var(--font-heading)'
            }}
          >
            Active Listings ({activeListings.length})
            {activeTab === 'active' && (
              <div style={{ 
                position: 'absolute', 
                bottom: 0, left: 0, right: 0, 
                height: '2px', 
                background: 'var(--primary)' 
              }} />
            )}
          </button>

          <button 
            onClick={() => setActiveTab('sold')}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'sold' ? '#fff' : 'var(--text-muted)',
              fontSize: '1.1rem',
              fontWeight: 600,
              padding: '12px 6px',
              cursor: 'pointer',
              position: 'relative',
              outline: 'none',
              fontFamily: 'var(--font-heading)'
            }}
          >
            Sold History ({soldListings.length})
            {activeTab === 'sold' && (
              <div style={{ 
                position: 'absolute', 
                bottom: 0, left: 0, right: 0, 
                height: '2px', 
                background: 'var(--primary)' 
              }} />
            )}
          </button>
        </div>

        {/* Visibility logic */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <span className="form-label" style={{ color: 'var(--primary)' }}>Scanning inventory...</span>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
            <ShoppingBag size={36} className="text-muted" style={{ marginBottom: '16px', opacity: 0.4 }} />
            <h3>No Listings Found</h3>
            <p className="text-muted mt-4">
              {activeTab === 'active' 
                ? "You don't have any items active for sale right now." 
                : "You haven't completed any sales yet. Make suggestions in chat to seal deals!"}
            </p>
            {activeTab === 'active' && (
              <Link to="/sell" className="btn btn-primary mt-4">Sell Item Now</Link>
            )}
          </div>
        ) : (
          <div className="product-grid">
            {visibleProducts.map(product => (
              <Link key={product._id} to={`/products/${product._id}`} className="glass-card" style={{ 
                padding: 0, 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column' 
              }}>
                <div style={{ 
                  height: '180px', 
                  background: product.image ? `url(${product.image}) center/cover no-repeat` : 'linear-gradient(135deg, var(--bg-deep) 0%, var(--primary-glow) 100%)',
                  position: 'relative'
                }}>
                  <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                    <span className="badge badge-new">{product.condition}</span>
                  </div>
                  {product.status === 'sold' && (
                    <div style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: 'rgba(0,0,0,0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--success)',
                      fontWeight: 800,
                      gap: '6px'
                    }}>
                      <CheckCircle size={20} /> SOLD
                    </div>
                  )}
                  {product.status === 'pending' && (
                    <div style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--warning)',
                      fontWeight: 800
                    }}>
                      PENDING
                    </div>
                  )}
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <div className="flex justify-between align-center">
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700 }}>
                      {product.category}
                    </span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem' }}>
                      ${product.price}
                    </span>
                  </div>
                  
                  <h4 style={{ color: '#fff', fontSize: '1.1rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
