import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('user');
      fetch('http://localhost:5001/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      }).then(() => {
        navigate('/');
      }).catch(error => {
        console.error('Logout error:', error);
        navigate('/');
      });
    }
  };

  return (
    <nav>
      <div className="navbar-brand">TutorConnect</div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        {!user && <li><Link to="/login">Login</Link></li>}
        {user && <li><Link to="/profile">Profile</Link></li>}
        {user && <li><Link to="/messages">Messages</Link></li>}
      </ul>
      {user && (
        <div className="user-info">
          {user.role === 'student' && (
            <Link className="search-nav-btn" to="/search">
              Search
            </Link>
          )}
          <span>{user.username}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
