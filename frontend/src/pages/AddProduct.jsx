import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Upload, DollarSign, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const AddProduct = () => {
  const { authFetch, user, showToast } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Books');
  const [condition, setCondition] = useState('Good');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Books', 'Electronics', 'Clothing', 'Dorm & Housing', 'Sports & Outdoors', 'Other'];
  const conditions = ['New', 'Like New', 'Good', 'Fair'];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Base64 string
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !price || !category || !condition) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await authFetch('/products', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price),
          category,
          condition,
          image,
          college: user.college
        })
      });

      if (response.ok) {
        showToast('Item listed successfully!');
        navigate('/');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post listing');
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      {/* Navigation and Title */}
      <div className="flex align-center gap-2 mb-4" style={{ cursor: 'pointer' }} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} className="text-muted" />
        <span className="text-muted" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Back to Browse</span>
      </div>

      <h2 className="mb-4" style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)' }}>
        List an Item for Sale
      </h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
        {/* Left Side: Form */}
        <form onSubmit={handleSubmit} className="glass-card" style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Listing Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Apple iPad Pro (11-inch, 128GB) or Math 101 Textbook"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Item Description *</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the condition, features, why you are selling, or meetup preferences (e.g. Stanford Bookstore library meetup)."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <div className="form-group" style={{ flex: '1 1 200px' }}>
              <label className="form-label">Price ($ USD) *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <DollarSign size={16} className="text-muted" style={{ position: 'absolute', left: '12px' }} />
                <input
                  type="number"
                  className="form-input"
                  style={{ paddingLeft: '32px' }}
                  placeholder="25"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ flex: '1 1 200px' }}>
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat} style={{ backgroundColor: 'var(--bg-deep)' }}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: '1 1 200px' }}>
              <label className="form-label">Condition *</label>
              <select
                className="form-select"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                {conditions.map((cond, idx) => (
                  <option key={idx} value={cond} style={{ backgroundColor: 'var(--bg-deep)' }}>{cond}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Upload Input */}
          <div className="form-group">
            <label className="form-label">Add Listing Photo</label>
            <div style={{
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.01)',
              transition: 'var(--transition)',
            }}
            onClick={() => document.getElementById('file-upload').click()}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <Upload size={32} className="text-muted" style={{ margin: '0 auto 8px auto', opacity: 0.6 }} />
              <div className="form-label" style={{ margin: 0 }}>Click to Select File</div>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>Supports JPG, PNG, GIF up to 5MB</span>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ padding: '16px' }}
            disabled={loading}
          >
            {loading ? 'Publishing Listing...' : 'Publish Item'}
          </button>
        </form>

        {/* Right Side: Preview */}
        <div style={{ flex: '1 1 300px' }}>
          <h3 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
            Live Preview
          </h3>
          <div className="glass-card" style={{ 
            padding: 0, 
            overflow: 'hidden', 
            borderRadius: 'var(--radius-md)',
            borderColor: 'var(--primary-glow)',
            boxShadow: 'var(--shadow-primary)'
          }}>
            <div style={{ 
              height: '220px', 
              background: imagePreview ? `url(${imagePreview}) center/cover no-repeat` : 'linear-gradient(135deg, var(--bg-deep) 0%, var(--primary-glow) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {!imagePreview && <ImageIcon size={40} className="text-muted" style={{ opacity: 0.3 }} />}
              <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                <span className="badge badge-new">{condition}</span>
              </div>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="flex justify-between align-center">
                <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700 }}>
                  {category}
                </span>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem' }}>
                  ${price || '0'}
                </span>
              </div>
              <h4 style={{ fontSize: '1.2rem', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {title || 'Listing Title'}
              </h4>
              <p className="text-muted" style={{ fontSize: '0.85rem', minHeight: '40px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {description || 'Item description details will show here as you fill out the form.'}
              </p>
              <div className="flex align-center gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ fontStyle: 'italic' }}>Campus: {user.college}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
