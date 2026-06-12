import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { formatSubject } from '../constants/subjects';
import { compareAppointmentsByStart, formatStoredDate, getStoredDateInputValue, isUpcomingAppointment } from '../utils/appointments';
import '../styles/pages/Sessions.css';

const API_URL = 'http://localhost:5001/api';

const getSessionHours = (startTime, endTime) => {
  if (!startTime || !endTime) return null;

  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  if ([startHour, startMinute, endHour, endMinute].some(Number.isNaN)) {
    return null;
  }

  const startTotalMinutes = (startHour * 60) + startMinute;
  const endTotalMinutes = (endHour * 60) + endMinute;
  const durationMinutes = endTotalMinutes - startTotalMinutes;

  return durationMinutes > 0 ? durationMinutes / 60 : null;
};

const formatEstimatedCost = (session) => {
  const hours = getSessionHours(session.startTime, session.endTime);
  const hourlyRate = Number(session.tutorProfile?.cost);

  if (!hours || Number.isNaN(hourlyRate)) {
    return 'Not available';
  }

  return `$${(hours * hourlyRate).toFixed(2)}`;
};

const matchesAvailabilitySlot = (appointment, availability = []) => availability.some((slot) => (
  getStoredDateInputValue(slot.date) === getStoredDateInputValue(appointment.date)
  && slot.startTime === appointment.startTime
  && slot.endTime === appointment.endTime
  && (slot.meetingType === 'both' || slot.meetingType === appointment.location)
));

const isConfirmedSession = (session) => Boolean(session.confirmed || session.availability || session.availabilityBacked);

function Sessions() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [tutoringSessions, setTutoringSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('sessions');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

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

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const me = await request('/auth/me');
      localStorage.setItem('user', JSON.stringify(me));
      setUser(me);

      const appointmentData = await request('/user/appointments');
      const hydrated = await Promise.all((appointmentData.appointments || []).map(async (appointment) => {
        try {
          const tutor = await request(`/tutor/info/${appointment.tutor}`);
          const tutorUser = await request(`/user/${tutor.user}`);
          const availabilityData = await request(`/tutor/availability/${appointment.tutor}`);
          return {
            ...appointment,
            tutorProfile: tutor,
            tutorUser: tutorUser,
            availabilityBacked: matchesAvailabilitySlot(appointment, availabilityData.availability || [])
          };
        } catch {
          return appointment;
        }
      }));

      setSessions(hydrated.filter(isUpcomingAppointment).sort(compareAppointmentsByStart));

      const hydratedTutoring = await Promise.all((appointmentData.tutoring || []).map(async (appointment) => {
        try {
          const student = await request(`/user/${appointment.student}`);
          const availabilityData = await request(`/tutor/availability/${appointment.tutor}`);
          return {
            ...appointment,
            studentInfo: student,
            availabilityBacked: matchesAvailabilitySlot(appointment, availabilityData.availability || [])
          };
        } catch {
          return appointment;
        }
      }));

      setTutoringSessions(hydratedTutoring.filter(isUpcomingAppointment).sort(compareAppointmentsByStart));
    } catch (loadError) {
      if (loadError.message === 'Not logged in') {
        navigate('/login');
      } else {
        setError(loadError.message);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, request]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const cancelSession = async (appointmentId) => {
    try {
      await request(`/appointment/${appointmentId}`, { method: 'DELETE' });
      setSessions((items) => items.filter((item) => item._id !== appointmentId));
      setTutoringSessions((items) => items.filter((item) => item._id !== appointmentId));
      setStatus('Session canceled.');
      setError('');
    } catch (cancelError) {
      setError(cancelError.message);
      setStatus('');
    }
  };

  const confirmSession = async (appointmentId) => {
    try {
      const data = await request(`/appointment/${appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify({ confirmed: true })
      });

      setTutoringSessions((items) => items.map((item) => (
        item._id === appointmentId ? { ...item, confirmed: data.appointment.confirmed } : item
      )).sort(compareAppointmentsByStart));
      setStatus('Session request confirmed.');
      setError('');
    } catch (confirmError) {
      setError(confirmError.message);
      setStatus('');
    }
  };

  const formatDate = (date) => {
    return formatStoredDate(date);
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="sessions-page">Loading sessions...</div>
      </>
    );
  }

  const tutorRequests = tutoringSessions.filter((session) => !isConfirmedSession(session));
  const confirmedTutoringSessions = tutoringSessions.filter(isConfirmedSession);
  const visibleTutorSessions = activeTab === 'requests' ? tutorRequests : confirmedTutoringSessions;

  return (
    <>
      <Navbar />
      <div className="sessions-page">
        <section className="sessions-shell">
          <h1>My Sessions</h1>
          {user.role === 'tutor' && (
            <div className="session-tabs">
              <button
                className={activeTab === 'sessions' ? 'active' : ''}
                type="button"
                onClick={() => setActiveTab('sessions')}
              >
                Confirmed
              </button>
              <button
                className={activeTab === 'requests' ? 'active' : ''}
                type="button"
                onClick={() => setActiveTab('requests')}
              >
                Requests
              </button>
            </div>
          )}
          {status && <div className="sessions-success">{status}</div>}
          {error && <div className="sessions-error">{error}</div>}
          {loading && <p className="sessions-note">Loading sessions...</p>}
          {!loading && user.role === 'student' && sessions.length === 0 && (
            <p className="sessions-note">No tutor sessions booked yet.</p>
          )}
          {!loading && user.role === 'tutor' && visibleTutorSessions.length === 0 && (
            <p className="sessions-note">
              {activeTab === 'requests' ? 'No pending session requests.' : 'No confirmed tutor sessions yet.'}
            </p>
          )}

          <div className="session-list">
            {user.role === 'student' && sessions.map((session) => (
              <div className="session-card" key={session._id}>
                <div>
                  <h2>{session.tutorUser?.username || 'Tutor'}</h2>
                  <p>{formatSubject(session.subject)}</p>
                  <span className={`session-status ${isConfirmedSession(session) ? 'confirmed' : 'pending'}`}>
                    {isConfirmedSession(session) ? 'Confirmed' : 'Unconfirmed'}
                  </span>
                </div>
                <div className="session-detail">
                  <span>Date</span>
                  <strong>{formatDate(session.date)}</strong>
                </div>
                <div className="session-detail">
                  <span>Time</span>
                  <strong>{session.startTime} - {session.endTime}</strong>
                </div>
                <div className="session-detail">
                  <span>Location</span>
                  <strong>{session.location || 'online'}</strong>
                </div>
                <div className="session-detail">
                  <span>Estimated Cost</span>
                  <strong>{formatEstimatedCost(session)}</strong>
                </div>
                <div className="session-actions">
                  {session.tutorProfile && (
                    <Link className="btn btn-primary session-action-btn" to={`/tutors/${session.tutor}`}>
                      Tutor Profile
                    </Link>
                  )}
                  {session.tutorProfile && (
                    <Link className="btn btn-secondary session-action-btn" to={`/messages?with=${session.tutorProfile.user}`}>
                      Message
                    </Link>
                  )}
                  <button className="btn btn-danger session-action-btn" type="button" onClick={() => cancelSession(session._id)}>
                    Cancel
                  </button>
                </div>
              </div>
            ))}
            {user.role === 'tutor' && visibleTutorSessions.map((session) => (
              <div className="session-card" key={session._id}>
                <div>
                  <h2>{session.studentInfo?.username || 'Student'}</h2>
                  <p>{formatSubject(session.subject)}</p>
                  <span className={`session-status ${isConfirmedSession(session) ? 'confirmed' : 'pending'}`}>
                    {isConfirmedSession(session) ? 'Confirmed' : 'Unconfirmed'}
                  </span>
                </div>
                <div className="session-detail">
                  <span>Date</span>
                  <strong>{formatDate(session.date)}</strong>
                </div>
                <div className="session-detail">
                  <span>Time</span>
                  <strong>{session.startTime} - {session.endTime}</strong>
                </div>
                <div className="session-detail">
                  <span>Location</span>
                  <strong>{session.location || 'online'}</strong>
                </div>
                <div className="session-detail">
                  <span>Student</span>
                  <strong>{session.studentInfo?.email || 'Student account'}</strong>
                </div>
                <div className="session-actions">
                  {session.studentInfo && (
                    <Link className="btn btn-secondary session-action-btn" to={`/messages?with=${session.student}`}>
                      Message
                    </Link>
                  )}
                  {!isConfirmedSession(session) && (
                    <button className="btn btn-primary session-action-btn" type="button" onClick={() => confirmSession(session._id)}>
                      Confirm
                    </button>
                  )}
                  <button className="btn btn-danger session-action-btn" type="button" onClick={() => cancelSession(session._id)}>
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export default Sessions;
