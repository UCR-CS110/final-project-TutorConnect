import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/pages/Search.css';

const API_URL = 'http://localhost:5001/api';
const SUBJECT_FILTERS = ['Math', 'English', 'Science', 'History', 'Foreign Languages', 'Humanities'];

function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [searchText, setSearchText] = useState(searchParams.get('q') || '');
  const [subjectFilter, setSubjectFilter] = useState(searchParams.get('subject') || '');
  const [priceSort, setPriceSort] = useState(searchParams.get('sort') || '');
  const [results, setResults] = useState([]);
  const [bookingForms, setBookingForms] = useState({});
  const [reviewForms, setReviewForms] = useState({});
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const hydrateTutors = useCallback(async (tutors) => Promise.all(tutors.map(async (tutor) => {
    try {
      const tutorUser = await request(`/user/${tutor.user}`);
      return { ...tutor, userInfo: tutorUser };
    } catch {
      return tutor;
    }
  })), [request]);

  const runSearch = useCallback(async (params) => {
    setLoading(true);
    setError('');
    setStatus('');

    try {
      const data = params.subject
        ? await request(`/tutor/tutors-by-subject/${encodeURIComponent(params.subject)}`)
        : await request('/tutor/tutors');
      let tutorResults = await hydrateTutors(data.tutors || []);

      if (params.q) {
        const search = params.q.toLowerCase();
        tutorResults = tutorResults.filter((tutor) => {
          const subjects = (tutor.subjects || []).join(' ');
          const text = [
            tutor.userInfo?.username,
            tutor.userInfo?.email,
            tutor.bio,
            tutor.relatedWork,
            subjects
          ].filter(Boolean).join(' ').toLowerCase();

          return text.includes(search);
        });
      }

      if (params.sort === 'low-high') {
        tutorResults.sort((a, b) => (a.cost || 0) - (b.cost || 0));
      }

      if (params.sort === 'high-low') {
        tutorResults.sort((a, b) => (b.cost || 0) - (a.cost || 0));
      }

      setResults(tutorResults);
    } catch (searchError) {
      setResults([]);
      setError(searchError.message);
    } finally {
      setLoading(false);
    }
  }, [hydrateTutors, request]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }

    setUser(storedUser);
    if (storedUser.role !== 'student') {
      return;
    }

    const params = {
      q: searchParams.get('q') || '',
      subject: searchParams.get('subject') || '',
      sort: searchParams.get('sort') || ''
    };

    setSearchText(params.q);
    setSubjectFilter(params.subject);
    setPriceSort(params.sort);
    runSearch(params);
  }, [navigate, runSearch, searchParams]);

  const submitSearch = (e) => {
    e.preventDefault();

    const nextParams = {
      q: searchText.trim()
    };

    if (subjectFilter) nextParams.subject = subjectFilter;
    if (priceSort) nextParams.sort = priceSort;

    setSearchParams(nextParams);
  };

  const updateBookingForm = (tutorId, field, value) => {
    setBookingForms((forms) => ({
      ...forms,
      [tutorId]: {
        date: '',
        startTime: '',
        endTime: '',
        location: 'online',
        subject: '',
        ...(forms[tutorId] || {}),
        [field]: value
      }
    }));
  };

  const bookTutor = async (e, tutorId) => {
    e.preventDefault();
    const booking = bookingForms[tutorId] || {};
    const payload = { tutorId, ...booking };
    if (!payload.date) {
      delete payload.date;
    }

    try {
      await request('/appointment/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setBookingForms((forms) => ({ ...forms, [tutorId]: undefined }));
      setStatus('Appointment booked.');
      setError('');
    } catch (bookError) {
      setError(bookError.message);
      setStatus('');
    }
  };

  const updateReviewForm = (tutorId, field, value) => {
    setReviewForms((forms) => ({
      ...forms,
      [tutorId]: {
        subject: '',
        rating: '5',
        comment: '',
        ...(forms[tutorId] || {}),
        [field]: value
      }
    }));
  };

  const submitReview = async (e, tutorId) => {
    e.preventDefault();
    const review = reviewForms[tutorId] || {};

    try {
      await request('/review/', {
        method: 'POST',
        body: JSON.stringify({
          tutorId,
          subject: review.subject,
          rating: Number(review.rating),
          comment: review.comment
        })
      });
      setReviewForms((forms) => ({ ...forms, [tutorId]: undefined }));
      setStatus('Review submitted.');
      setError('');
    } catch (reviewError) {
      setError(reviewError.message);
      setStatus('');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (user.role !== 'student') {
    return (
      <>
        <Navbar />
        <div className="search-page">
          <div className="search-shell">
            <h1>Search</h1>
            <p className="search-note">Search is available for student profiles.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="search-page">
        <div className="search-shell">
          <h1>Search</h1>
          <form className="search-page-form" onSubmit={submitSearch}>
            <div className="search-main-row">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search tutors by name"
              />
              <button className="btn btn-primary" type="submit">
                Search
              </button>
            </div>

            <div className="search-filter-row">
              <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                <option value="">All subjects</option>
                {SUBJECT_FILTERS.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              <select value={priceSort} onChange={(e) => setPriceSort(e.target.value)}>
                <option value="">No price sort</option>
                <option value="low-high">Price: low to high</option>
                <option value="high-low">Price: high to low</option>
              </select>
            </div>
          </form>

          {status && <div className="search-success">{status}</div>}
          {error && <div className="search-error">{error}</div>}
          {loading && <div className="search-note">Searching...</div>}

          <div className="search-dropdown-results">
            {!loading && results.length === 0 && <div className="search-note">No results found.</div>}
            {results.map((result) => (
              <TutorResult
                key={result._id}
                tutor={result}
                booking={bookingForms[result._id] || {}}
                review={reviewForms[result._id] || {}}
                onBookingChange={updateBookingForm}
                onBook={bookTutor}
                onReviewChange={updateReviewForm}
                onReview={submitReview}
                onMessage={() => navigate(`/messages?with=${result.user}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function TutorResult({ tutor, booking, review, onBookingChange, onBook, onReviewChange, onReview, onMessage }) {
  return (
    <div className="search-name-card">
      <div className="name-card-header">
        <div>
          <h2>
            <Link className="tutor-name-link" to={`/tutors/${tutor._id}`}>
              {tutor.userInfo?.username || 'Tutor'}
            </Link>
          </h2>
          <p>{tutor.userInfo?.email || 'Contact through TutorConnect'}</p>
        </div>
        <span className="search-role-badge tutor">Tutor</span>
      </div>
      <p>{tutor.bio || 'No bio yet.'}</p>
      <div className="search-subject-list">
        {(tutor.subjects || []).map((subject) => (
          <span key={subject}>{subject}</span>
        ))}
      </div>
      <div className="search-card-meta">
        <strong>${tutor.cost || 0}/hr</strong>
        <span>{Number(tutor.ratingAverage || 0).toFixed(1)} stars ({tutor.numRatings || 0})</span>
      </div>
      <button className="btn btn-secondary" type="button" onClick={onMessage}>Message Tutor</button>

      <form className="search-mini-form" onSubmit={(e) => onBook(e, tutor._id)}>
        <h3>Book Session</h3>
        <div className="search-form-row">
          <input type="date" value={booking.date || ''} onChange={(e) => onBookingChange(tutor._id, 'date', e.target.value)} />
          <input type="time" value={booking.startTime || ''} onChange={(e) => onBookingChange(tutor._id, 'startTime', e.target.value)} required />
          <input type="time" value={booking.endTime || ''} onChange={(e) => onBookingChange(tutor._id, 'endTime', e.target.value)} required />
        </div>
        <div className="search-form-row">
          <select value={booking.location || 'online'} onChange={(e) => onBookingChange(tutor._id, 'location', e.target.value)}>
            <option value="online">Online</option>
            <option value="in-person">In person</option>
          </select>
          <input value={booking.subject || ''} onChange={(e) => onBookingChange(tutor._id, 'subject', e.target.value)} placeholder="Subject" required />
        </div>
        <button className="btn btn-primary" type="submit">Book</button>
      </form>

      <form className="search-mini-form" onSubmit={(e) => onReview(e, tutor._id)}>
        <h3>Leave Review</h3>
        <div className="search-form-row">
          <input value={review.subject || ''} onChange={(e) => onReviewChange(tutor._id, 'subject', e.target.value)} placeholder="Subject" required />
          <select value={review.rating || '5'} onChange={(e) => onReviewChange(tutor._id, 'rating', e.target.value)}>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
        </div>
        <textarea value={review.comment || ''} onChange={(e) => onReviewChange(tutor._id, 'comment', e.target.value)} placeholder="How did it go?" />
        <button className="btn btn-secondary" type="submit">Submit Review</button>
      </form>
    </div>
  );
}

export default Search;
