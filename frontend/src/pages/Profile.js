import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/pages/Profile.css';

const API_URL = 'http://localhost:5001/api';

function Profile() {
  const [user, setUser] = useState(null);
  const [tutorProfile, setTutorProfile] = useState(null);
  const [tutorForm, setTutorForm] = useState({ bio: '', subjects: '', cost: '', relatedWork: '' });
  const [availabilityForm, setAvailabilityForm] = useState({ date: '', startTime: '', endTime: '', meetingType: 'online' });
  const [availabilities, setAvailabilities] = useState([]);
  const [appointments, setAppointments] = useState({ tutoring: [], appointments: [] });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      throw new Error(data.error || data.details || 'Something went wrong');
    }

    return data;
  }, []);

  const formatDate = (date) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString();
  };

  const parseSubjects = (subjects) => subjects
    .split(',')
    .map((subject) => subject.trim())
    .filter(Boolean);

  const loadDashboard = useCallback(async () => {
    setError('');
    setStatus('');
    setLoading(true);

    try {
      const freshUser = await request('/auth/me');
      localStorage.setItem('user', JSON.stringify(freshUser));
      setUser(freshUser);
      const appointmentData = await request('/user/appointments');
      setAppointments(appointmentData);

      if (freshUser.role === 'tutor') {
        try {
          const tutor = await request('/tutor/');
          setTutorProfile(tutor);
          setTutorForm({
            bio: tutor.bio || '',
            subjects: (tutor.subjects || []).join(', '),
            cost: tutor.cost || '',
            relatedWork: tutor.relatedWork || ''
          });

          const availabilityData = await request('/availability/see-all');
          setAvailabilities(availabilityData.availabilities || []);
        } catch (tutorError) {
          setTutorProfile(null);
          setAvailabilities([]);
          setTutorForm({ bio: '', subjects: '', cost: '', relatedWork: '' });
        }
      }
    } catch (loadError) {
      if (loadError.message === 'Not logged in') {
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        console.error('Profile load error:', loadError);
        setError('');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, request]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
      return;
    }

    setUser(storedUser);
    loadDashboard();
  }, [loadDashboard, navigate]);

  const showSuccess = (message) => {
    setStatus(message);
    setError('');
  };

  const showError = (message) => {
    setError(message);
    setStatus('');
  };

  const saveTutorProfile = async (e) => {
    e.preventDefault();

    const payload = {
      bio: tutorForm.bio,
      subjects: parseSubjects(tutorForm.subjects),
      cost: Number(tutorForm.cost) || 0,
      relatedWork: tutorForm.relatedWork
    };

    try {
      const data = tutorProfile
        ? await request('/tutor/', { method: 'PUT', body: JSON.stringify(payload) })
        : await request('/tutor/register', { method: 'POST', body: JSON.stringify(payload) });

      setTutorProfile(data.tutor);
      setTutorForm({
        bio: data.tutor.bio || '',
        subjects: (data.tutor.subjects || []).join(', '),
        cost: data.tutor.cost || '',
        relatedWork: data.tutor.relatedWork || ''
      });

      const freshUser = await request('/auth/me');
      localStorage.setItem('user', JSON.stringify(freshUser));
      setUser(freshUser);
      showSuccess(tutorProfile ? 'Tutor profile updated.' : 'Tutor profile created.');
      loadDashboard();
    } catch (saveError) {
      showError(saveError.message);
    }
  };

  const saveAvailability = async (e) => {
    e.preventDefault();
    try {
      await request('/availability/', {
        method: 'POST',
        body: JSON.stringify(availabilityForm)
      });
      setAvailabilityForm({ date: '', startTime: '', endTime: '', meetingType: 'online' });
      showSuccess('Availability added.');
      loadDashboard();
    } catch (saveError) {
      showError(saveError.message);
    }
  };

  const deleteAvailability = async (availabilityId) => {
    try {
      await request(`/availability/${availabilityId}`, { method: 'DELETE' });
      setAvailabilities((items) => items.filter((item) => item._id !== availabilityId));
      showSuccess('Availability removed.');
    } catch (deleteError) {
      showError(deleteError.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await request(`/appointment/${appointmentId}`, { method: 'DELETE' });
      showSuccess('Appointment canceled.');
      loadDashboard();
    } catch (cancelError) {
      showError(cancelError.message);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const isTutor = user.role === 'tutor';
  const roleTitle = isTutor ? 'Tutor' : 'Student';
  const firstLetter = user.username.charAt(0).toUpperCase();
  const studentAppointments = appointments.appointments || [];
  const tutorAppointments = appointments.tutoring || [];
  const sessionCount = studentAppointments.length + tutorAppointments.length;
  const ratingSource = isTutor ? tutorProfile : user;
  const ratingDisplay = ratingSource && ratingSource.numRatings > 0
    ? Number(ratingSource.ratingAverage || 0).toFixed(1)
    : 'NA';

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">{firstLetter}</div>
          <div className="profile-info">
            <div className="profile-title">
              <h1>{user.username}</h1>
              <span className={`role-badge ${isTutor ? 'tutor' : 'student'}`}>{roleTitle}</span>
            </div>
            <div className="profile-rating" aria-label={`Rating ${ratingDisplay}`}>
              <span className="rating-star">★</span>
              <span>{ratingDisplay}</span>
            </div>
            <p>{user.email}</p>
            <div className="profile-stat">
              <div className="stat">
                <span className="stat-number">{sessionCount}</span>
                <span className="stat-label">Sessions</span>
              </div>
              <div className="stat">
                <span className="stat-number">{isTutor && tutorProfile ? tutorProfile.numRatings : studentAppointments.length}</span>
                <span className="stat-label">{isTutor ? 'Reviews' : 'Booked'}</span>
              </div>
            </div>
          </div>
        </div>

        {status && <div className="success-message">{status}</div>}
        {error && <div className="error-message">{error}</div>}
        {loading && <div className="section muted-section">Loading dashboard...</div>}

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
          </div>

          <Link className="btn btn-primary edit-account-link" to="/edit-account">Edit Account</Link>
        </div>

        {isTutor ? (
          <>
            <div className="section">
              <h2>{tutorProfile ? 'Tutor Profile' : 'Create Tutor Profile'}</h2>
              {!tutorProfile && (
                <p className="section-note">Finish your tutor profile before adding availability or receiving bookings.</p>
              )}
              <form className="dashboard-form" onSubmit={saveTutorProfile}>
                <div className="form-group">
                  <label htmlFor="tutor-bio">Bio</label>
                  <textarea
                    id="tutor-bio"
                    value={tutorForm.bio}
                    onChange={(e) => setTutorForm({ ...tutorForm, bio: e.target.value })}
                    placeholder="Tell students how you can help"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="tutor-subjects">Subjects</label>
                    <input
                      id="tutor-subjects"
                      value={tutorForm.subjects}
                      onChange={(e) => setTutorForm({ ...tutorForm, subjects: e.target.value })}
                      placeholder="Math, chemistry, writing"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="tutor-cost">Hourly Cost</label>
                    <input
                      id="tutor-cost"
                      type="number"
                      min="0"
                      value={tutorForm.cost}
                      onChange={(e) => setTutorForm({ ...tutorForm, cost: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="tutor-related-work">Related Work</label>
                  <textarea
                    id="tutor-related-work"
                    value={tutorForm.relatedWork}
                    onChange={(e) => setTutorForm({ ...tutorForm, relatedWork: e.target.value })}
                    placeholder="Experience, classes, certifications, or other relevant background"
                  />
                </div>
                <button className="btn btn-primary" type="submit">
                  {tutorProfile ? 'Update Tutor Profile' : 'Create Tutor Profile'}
                </button>
              </form>
            </div>

            {tutorProfile && (
              <div className="section">
                <h2>Availability</h2>
                <form className="dashboard-form compact-form" onSubmit={saveAvailability}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="availability-date">Date</label>
                      <input
                        id="availability-date"
                        type="date"
                        value={availabilityForm.date}
                        onChange={(e) => setAvailabilityForm({ ...availabilityForm, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="availability-start">Start Time</label>
                      <input
                        id="availability-start"
                        type="time"
                        value={availabilityForm.startTime}
                        onChange={(e) => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="availability-end">End Time</label>
                      <input
                        id="availability-end"
                        type="time"
                        value={availabilityForm.endTime}
                        onChange={(e) => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="availability-type">Meeting Type</label>
                      <select
                        id="availability-type"
                        value={availabilityForm.meetingType}
                        onChange={(e) => setAvailabilityForm({ ...availabilityForm, meetingType: e.target.value })}
                      >
                        <option value="online">Online</option>
                        <option value="in-person">In person</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>
                  <button className="btn btn-primary" type="submit">Add Availability</button>
                </form>

                <div className="list-grid">
                  {availabilities.length === 0 && <p className="section-note">No availability added yet.</p>}
                  {availabilities.map((availability) => (
                    <div className="list-card" key={availability._id}>
                      <strong>{formatDate(availability.date)}</strong>
                      <span>{availability.startTime} - {availability.endTime}</span>
                      <span>{availability.meetingType}</span>
                      <button className="btn btn-danger" type="button" onClick={() => deleteAvailability(availability._id)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <AppointmentsSection
              title="Tutor Appointments"
              appointments={tutorAppointments}
              emptyText="No students have booked sessions yet."
              onCancel={cancelAppointment}
              formatDate={formatDate}
            />
          </>
        ) : (
          <>
            <AppointmentsSection
              title="My Appointments"
              appointments={studentAppointments}
              emptyText="No sessions booked yet."
              onCancel={cancelAppointment}
              formatDate={formatDate}
            />
          </>
        )}
      </div>
    </>
  );
}

function AppointmentsSection({ title, appointments, emptyText, onCancel, formatDate }) {
  return (
    <div className="section">
      <h2>{title}</h2>
      <div className="list-grid">
        {appointments.length === 0 && <p className="section-note">{emptyText}</p>}
        {appointments.map((appointment) => (
          <div className="list-card" key={appointment._id}>
            <strong>{appointment.subject}</strong>
            <span>{formatDate(appointment.date)}</span>
            <span>{appointment.startTime} - {appointment.endTime}</span>
            <span>{appointment.location || appointment.meetingType || 'online'}</span>
            <button className="btn btn-danger" type="button" onClick={() => onCancel(appointment._id)}>
              Cancel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
