import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/pages/Home.css';

function Home() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="hero">
          <h1>Welcome to TutorConnect</h1>
          <p>Connect with experienced tutors and accelerate your learning journey</p>
          <div className="cta-buttons">
            {user ? (
              <Link to="/profile" className="btn btn-primary">Go to Profile</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary">Get Started</Link>
                <a href="#features" className="btn btn-secondary">Learn More</a>
              </>
            )}
          </div>
        </div>

        <div className="features" id="features">
          <div className="feature-card">
            <h3>Find Tutors</h3>
            <p>Browse a wide selection of qualified tutors in various subjects</p>
          </div>
          <div className="feature-card">
            <h3>Easy Scheduling</h3>
            <p>Schedule sessions at times that work best for you</p>
          </div>
          <div className="feature-card">
            <h3>Track Progress</h3>
            <p>Monitor your learning progress with detailed reviews</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
