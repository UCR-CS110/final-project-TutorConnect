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
            <h1>Having trouble learning?</h1>
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
        <div className="how-it-works">
          <div className="section-heading">
            <h2>How TutorConnect Works</h2>
            <p>Find support, schedule sessions, and keep track of your learning progress.</p>
          </div>
          <div className="steps">
            <div className="step-card">
              <span className="step-number">1</span>
              <h3>Search for a tutor</h3>
              <p>Browse tutors by subject and find someone who matches what you need help with.</p>
            </div>

            <div className="step-card">
              <span className="step-number">2</span>
              <h3>Book a session</h3>
              <p>Choose a time and session type that works for your schedule.</p>
            </div>

            <div className="step-card">
              <span className="step-number">3</span>
              <h3>Review your experience</h3>
              <p>Leave ratings and comments to help other students find reliable tutors.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
