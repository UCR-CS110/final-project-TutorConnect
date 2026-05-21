import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/pages/Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      } else {
        setError(data.error || 'Login failed');
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
          <li><Link to="/login" style={{ color: '#3498db', textDecoration: 'none', borderBottom: '2px solid #3498db', paddingBottom: '0.25rem' }}>Login</Link></li>
        </ul>
      </nav>

      <div className="login-container">
        <div className="login-card">
          <h2>Login to TutorConnect</h2>
          
          {error && <div className="error-message" style={{ display: 'block' }}>{error}</div>}
          {success && <div className="success-message" style={{ display: 'block' }}>{success}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
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
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            {loading && (
              <div className="loading" style={{ display: 'block' }}>
                <div className="spinner"></div>
                <p>Logging in...</p>
              </div>
            )}
          </form>

          <div className="signup-link">
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
