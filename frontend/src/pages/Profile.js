import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/pages/Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const isTutor = user.role === 'tutor';
  const roleTitle = isTutor ? 'Tutor' : 'Student';
  const firstLetter = user.username.charAt(0).toUpperCase();

  return (
    <>
      <Navbar />
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">{firstLetter}</div>
          <div className="profile-info">
            <div className="profile-title">
              <h1>{user.username}</h1>
              <span className={`role-badge ${isTutor ? 'tutor' : 'student'}`}>{roleTitle}</span>
            </div>
            <p>{user.email}</p>
            <div className="profile-stat">
              <div className="stat">
                <span className="stat-number">0</span>
                <span className="stat-label">Sessions</span>
              </div>
              <div className="stat">
                <span className="stat-number">0</span>
                <span className="stat-label">{isTutor ? 'Students' : 'Reviews'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="section">
          <h2>Account Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Username</div>
              <div className="info-value">{user.username}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Email</div>
              <div className="info-value">{user.email}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Account Type</div>
              <div className="info-value">{roleTitle}</div>
            </div>
            {!isTutor && (
              <div className="info-item">
                <div className="info-label">School or University</div>
                <div className="info-value">{user.school || 'Not provided'}</div>
              </div>
            )}
            <div className="info-item">
              <div className="info-label">Member Since</div>
              <div className="info-value">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            {isTutor ? (
              <>
                <button className="btn btn-primary" onClick={() => alert('Tutor feature coming soon!')}>Tutor Dashboard</button>
                <button className="btn btn-primary" onClick={() => alert('Tutor feature coming soon!')}>Manage Availability</button>
                <button className="btn btn-primary" onClick={() => alert('Tutor feature coming soon!')}>Edit Tutor Profile</button>
              </>
            ) : (
              <>
                <button className="btn btn-primary" onClick={() => alert('This feature is coming soon!')}>Find Tutors</button>
                <button className="btn btn-primary" onClick={() => alert('This feature is coming soon!')}>My Sessions</button>
                <button className="btn btn-primary" onClick={() => alert('This feature is coming soon!')}>Edit Profile</button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
