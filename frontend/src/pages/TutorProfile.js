import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/pages/TutorProfile.css';

const API_URL = 'http://localhost:5001/api';

function TutorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tutor, setTutor] = useState(null);
  const [tutorUser, setTutorUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [booking, setBooking] = useState({ date: '', startTime: '', endTime: '', location: 'online', subject: '' });
  const [review, setReview] = useState({ subject: '', rating: '5', comment: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const request = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || data.details || 'Request failed');
    }

    return data;
  }, []);

  const loadTutor = useCallback(async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser) {
        navigate('/login');
        return;
      }
      setUser(storedUser);

      const tutorInfo = await request(`/tutor/info/${id}`);
      const tutorAccount = await request(`/user/${tutorInfo.user}`);
      const reviewData = await request(`/tutor/get-reviews/${id}`);
      setTutor(tutorInfo);
      setTutorUser(tutorAccount);
      setReviews(reviewData.reviews || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  }, [id, navigate, request]);

  useEffect(() => {
    loadTutor();
  }, [loadTutor]);

  const bookTutor = async (e) => {
    e.preventDefault();
    const payload = { tutorId: id, ...booking };
    if (!payload.date) {
      delete payload.date;
    }

    try {
      await request('/appointment/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setBooking({ date: '', startTime: '', endTime: '', location: 'online', subject: '' });
      setStatus('Appointment booked.');
      setError('');
    } catch (bookError) {
      setError(bookError.message);
      setStatus('');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await request('/review/', {
        method: 'POST',
        body: JSON.stringify({
          tutorId: id,
          subject: review.subject,
          rating: Number(review.rating),
          comment: review.comment
        })
      });
      setReview({ subject: '', rating: '5', comment: '' });
      setStatus('Review submitted.');
      setError('');
      loadTutor();
    } catch (reviewError) {
      setError(reviewError.message);
      setStatus('');
    }
  };

  if (!user || !tutor) {
    return (
      <>
        <Navbar />
        <div className="tutor-profile-page">Loading tutor profile...</div>
      </>
    );
  }

  const ratingDisplay = tutor.numRatings > 0 ? Number(tutor.ratingAverage || 0).toFixed(1) : 'NA';

  return (
    <>
      <Navbar />
      <div className="tutor-profile-page">
        <section className="tutor-profile-header">
          <div className="tutor-avatar">{(tutorUser?.username || 'T').charAt(0).toUpperCase()}</div>
          <div>
            <div className="tutor-title-row">
              <h1>{tutorUser?.username || 'Tutor'}</h1>
              <span className="tutor-badge">Tutor</span>
            </div>
            <div className="tutor-rating">★ {ratingDisplay}</div>
            <p>{tutorUser?.email}</p>
            <strong>${tutor.cost || 0}/hr</strong>
          </div>
        </section>

        {status && <div className="tutor-success">{status}</div>}
        {error && <div className="tutor-error">{error}</div>}

        <section className="tutor-section">
          <h2>Details</h2>
          <p>{tutor.bio || 'No bio yet.'}</p>
          <div className="tutor-subject-list">
            {(tutor.subjects || []).map((subject) => (
              <span key={subject}>{subject}</span>
            ))}
          </div>
          <h3>Related Work</h3>
          <p>{tutor.relatedWork || 'No related work listed.'}</p>
          <button className="btn btn-secondary message-tutor-btn" type="button" onClick={() => navigate(`/messages?with=${tutor.user}`)}>
            Message Tutor
          </button>
        </section>

        <section className="tutor-section">
          <h2>Book a Session</h2>
          <form className="tutor-form" onSubmit={bookTutor}>
            <div className="tutor-form-row">
              <input type="date" value={booking.date} onChange={(e) => setBooking({ ...booking, date: e.target.value })} />
              <input type="time" value={booking.startTime} onChange={(e) => setBooking({ ...booking, startTime: e.target.value })} required />
              <input type="time" value={booking.endTime} onChange={(e) => setBooking({ ...booking, endTime: e.target.value })} required />
            </div>
            <div className="tutor-form-row">
              <select value={booking.location} onChange={(e) => setBooking({ ...booking, location: e.target.value })}>
                <option value="online">Online</option>
                <option value="in-person">In person</option>
              </select>
              <input value={booking.subject} onChange={(e) => setBooking({ ...booking, subject: e.target.value })} placeholder="Subject" required />
            </div>
            <button className="btn btn-primary" type="submit">Book</button>
          </form>
        </section>

        <section className="tutor-section">
          <h2>Leave a Review</h2>
          <form className="tutor-form" onSubmit={submitReview}>
            <div className="tutor-form-row">
              <input value={review.subject} onChange={(e) => setReview({ ...review, subject: e.target.value })} placeholder="Subject" required />
              <select value={review.rating} onChange={(e) => setReview({ ...review, rating: e.target.value })}>
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
              </select>
            </div>
            <textarea value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} placeholder="Share feedback" />
            <button className="btn btn-secondary" type="submit">Submit Review</button>
          </form>
        </section>

        <section className="tutor-section">
          <h2>Reviews</h2>
          <div className="review-list">
            {reviews.length === 0 && <p>No reviews yet.</p>}
            {reviews.map((item) => (
              <div className="review-card" key={item._id}>
                <strong>★ {Number(item.rating || 0).toFixed(1)} - {item.subject}</strong>
                <p>{item.comment || 'No comment.'}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export default TutorProfile;
