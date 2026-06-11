import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeSelect, setCollegeSelect] = useState('Stanford University');
  const [customCollege, setCustomCollege] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const colleges = [
    'Stanford University',
    'Massachusetts Institute of Technology',
    'UC Berkeley',
    'Harvard University',
    'UT Austin',
    'New York University',
    'University of Michigan',
    'Other (Type below)'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const college = collegeSelect === 'Other (Type below)' ? customCollege : collegeSelect;
    
    if (!college) {
      alert('Please specify your college campus');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, college);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex align-center justify-center fade-in" style={{ minHeight: '70vh' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
        <h2 className="text-center mb-4" style={{ fontSize: '2rem', background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Create Account
        </h2>
        <p className="text-center text-muted mb-4" style={{ fontSize: '0.9rem' }}>
          Join CampusTrade to start buying and selling on campus
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="alex@stanford.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
              Using a .edu email awards a Verified Student badge!
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Select Campus / College</label>
            <select
              className="form-select"
              value={collegeSelect}
              onChange={(e) => setCollegeSelect(e.target.value)}
            >
              {colleges.map((col, idx) => (
                <option key={idx} value={col} style={{ backgroundColor: 'var(--bg-deep)' }}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          {collegeSelect === 'Other (Type below)' && (
            <div className="form-group">
              <label className="form-label">Custom College Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Yale University"
                value={customCollege}
                onChange={(e) => setCustomCollege(e.target.value)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block mt-4"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-muted mt-4" style={{ fontSize: '0.85rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
