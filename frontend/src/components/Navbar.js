import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [navSearch, setNavSearch] = useState('');

  const handleNavSearch = (e) => {
    e.preventDefault();
    const query = navSearch.trim();
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
  };

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
      <div className="navbar-brand">
        <img src="/tutorconnect-logo.png" alt="" className="navbar-logo" />
        <span>TutorConnect</span>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        {!user && <li><Link to="/login">Login</Link></li>}
        {user && <li><Link to="/profile">Profile</Link></li>}
        {user && <li><Link to="/messages">Messages</Link></li>}
        {user?.role === 'student' && <li><Link to="/sessions">My Sessions</Link></li>}
        {user?.role === 'student' && (
          <li>
            <form className="nav-search-form" onSubmit={handleNavSearch}>
              <span className="nav-search-icon" aria-hidden="true"></span>
              <input
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search"
                aria-label="Search tutors by name"
              />
            </form>
          </li>
        )}
      </ul>
      {user && (
        <div className="user-info">
          <span>{user.username}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
