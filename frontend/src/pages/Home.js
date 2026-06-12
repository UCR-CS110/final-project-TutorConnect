import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/pages/Home.css';
import heroImage from '../assets/images/frontpageHeroImage.jpg';

function Home() {
  return (
    <>
      <Navbar />
      <div className="home-page">
        <div className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="hero-content">
            <h1>Having trouble learning something?</h1>
            <p>We got you.</p>
            <div className="cta-buttons">
              <Link to="/search" className="btn btn-primary">Book a tutor now</Link>
              <Link to="/signup?role=tutor" className="btn btn-secondary">Become a tutor now</Link>
            </div>
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
