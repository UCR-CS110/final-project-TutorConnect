import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/pages/Signup.css';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      navigate('/profile');
    }
  }, [navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      } else {
        setError(data.error || 'Sign up failed');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav style={{
        backgroundColor: '#2c3e50',
        padding: '1rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>TutorConnect</div>
        <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
          <li><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link></li>
          <li><Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link></li>
        </ul>
      </nav>

      <div className="signup-container">
        <div className="signup-card">
          <h2>Create Your Account</h2>
          
          {error && <div className="error-message" style={{ display: 'block' }}>{error}</div>}
          {success && <div className="success-message" style={{ display: 'block' }}>{success}</div>}

          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Choose a username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
              />
            </div>

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>

            {loading && (
              <div className="loading" style={{ display: 'block' }}>
                <div className="spinner"></div>
                <p>Creating account...</p>
              </div>
            )}
          </form>

          <div className="login-link">
            Already have an account? <Link to="/login">Login here</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
