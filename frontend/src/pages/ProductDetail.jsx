import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Tag, ArrowLeft, MessageSquare, Trash2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch, user, showToast } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        showToast('Could not load listing details', 'error');
        navigate('/');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await authFetch(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        showToast(`Listing marked as ${newStatus}`);
        fetchProductDetails(); // refresh details
      } else {
        const data = await response.json();
        showToast(data.message || 'Failed to update status', 'error');
      }
    } catch (error) {
      showToast('Error updating status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing? This action is permanent.')) {
      return;
    }

    try {
      const response = await authFetch(`/products/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        showToast('Listing deleted successfully');
        navigate('/');
      } else {
        const data = await response.json();
        showToast(data.message || 'Failed to delete listing', 'error');
      }
    } catch (error) {
      showToast('Error deleting listing', 'error');
    }
  };

  const handleContactSeller = () => {
    const sellerId = product.seller._id || product.seller;
    navigate(`/inbox?chatUser=${sellerId}&starter=Hi, I am interested in your item: "${product.title}"`);
  };

  const getConditionBadge = (condition) => {
    switch (condition) {
      case 'New': return <span className="badge badge-new">New</span>;
      case 'Like New': return <span className="badge badge-like-new">Like New</span>;
      case 'Good': return <span className="badge badge-good">Good</span>;
      case 'Fair': return <span className="badge badge-fair">Fair</span>;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available': return <span className="badge badge-available">Available</span>;
      case 'pending': return <span className="badge badge-pending">Pending Meetup</span>;
      case 'sold': return <span className="badge badge-sold">Sold</span>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <span className="form-label" style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>Examining items...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="glass-card text-center" style={{ padding: '60px' }}>
        <AlertCircle size={48} className="text-danger mb-4" style={{ margin: '0 auto' }} />
        <h3>Listing Not Found</h3>
        <button onClick={() => navigate('/')} className="btn btn-secondary mt-4">
          Back to Listings
        </button>
      </div>
    );
  }

  const sellerId = product.seller._id ? product.seller._id.toString() : product.seller.toString();
  const isOwner = user && user._id === sellerId;

  return (
    <div className="fade-in">
      {/* Back Button */}
      <div className="flex align-center gap-2 mb-4" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
        <ArrowLeft size={16} className="text-muted" />
        <span className="text-muted" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Back to Browse</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', marginTop: '20px' }}>
        {/* Left Side: Product Image & Seller Details */}
        <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Photo Card */}
          <div className="glass-card" style={{ 
            padding: 0, 
            overflow: 'hidden', 
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '350px',
            maxHeight: '500px',
            background: product.image ? `url(${product.image}) center/contain no-repeat` : 'linear-gradient(135deg, var(--bg-deep) 0%, var(--primary-glow) 100%)',
          }}>
            {!product.image && (
              <span className="text-muted" style={{ fontSize: '1.2rem', opacity: 0.4 }}>No Photo Provided</span>
            )}
          </div>

          {/* Seller Card */}
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
            <div className="flex align-center gap-2" style={{ gap: '16px' }}>
              <img 
                src={product.seller.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${product.seller.name}`} 
                alt={product.seller.name} 
                style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--primary-glow)' }} 
              />
              <div>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {product.seller.name}
                  {product.seller.email.toLowerCase().endsWith('.edu') && (
                    <ShieldCheck size={16} className="brand-icon" style={{ color: 'var(--accent)' }} title="Verified Student Email" />
                  )}
                </h4>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                  {product.seller.college}
                </p>
              </div>
            </div>

            {!isOwner && (
              <button onClick={handleContactSeller} className="btn btn-primary btn-sm flex align-center gap-2">
                <MessageSquare size={16} /> Chat Seller
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Product Details & Actions */}
        <div style={{ flex: '1 2 450px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div className="flex align-center gap-2 mb-4" style={{ gap: '12px' }}>
              {getConditionBadge(product.condition)}
              {getStatusBadge(product.status)}
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
              {product.title}
            </h1>

            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
              ${product.price}
            </div>
          </div>

          {/* Location & Metadata */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="flex align-center gap-2" style={{ fontSize: '0.9rem' }}>
              <MapPin size={16} style={{ color: 'var(--primary)' }} />
              <span className="form-label" style={{ margin: 0, textTransform: 'none' }}>
                Available at: <strong>{product.college}</strong>
              </span>
            </div>
            
            <div className="flex align-center gap-2" style={{ fontSize: '0.9rem' }}>
              <Tag size={16} style={{ color: 'var(--secondary)' }} />
              <span className="form-label" style={{ margin: 0, textTransform: 'none' }}>
                Category: <strong>{product.category}</strong>
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#fff' }}>
              Description
            </h3>
            <p className="text-muted" style={{ fontSize: '1rem', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
              {product.description}
            </p>
          </div>

          {/* Owner Dashboard Controls */}
          {isOwner && (
            <div className="glass-card" style={{ 
              borderColor: 'rgba(139, 92, 246, 0.2)', 
              padding: '24px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              marginTop: '10px'
            }}>
              <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>Manage Your Listing</h4>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {product.status !== 'available' && (
                  <button 
                    onClick={() => handleStatusChange('available')} 
                    className="btn btn-secondary btn-sm flex align-center gap-2"
                  >
                    Mark as Available
                  </button>
                )}
                
                {product.status !== 'pending' && product.status !== 'sold' && (
                  <button 
                    onClick={() => handleStatusChange('pending')} 
                    className="btn btn-secondary btn-sm flex align-center gap-2"
                    style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}
                  >
                    Mark as Pending Meetup
                  </button>
                )}

                {product.status !== 'sold' && (
                  <button 
                    onClick={() => handleStatusChange('sold')} 
                    className="btn btn-primary btn-sm flex align-center gap-2"
                    style={{ background: 'var(--success)' }}
                  >
                    <CheckCircle2 size={16} /> Mark as Sold
                  </button>
                )}

                <button 
                  onClick={handleDelete} 
                  className="btn btn-danger btn-sm flex align-center gap-2"
                  style={{ marginLeft: 'auto' }}
                >
                  <Trash2 size={16} /> Delete Listing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
