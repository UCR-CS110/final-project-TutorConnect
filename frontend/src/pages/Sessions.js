import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/pages/Sessions.css';

const API_URL = 'http://localhost:5001/api';

function Sessions() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
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

      if (me.role !== 'student') {
        setSessions([]);
        return;
      }

      const appointmentData = await request('/user/appointments');
      const hydrated = await Promise.all((appointmentData.appointments || []).map(async (appointment) => {
        try {
          const tutor = await request(`/tutor/info/${appointment.tutor}`);
          const tutorUser = await request(`/user/${tutor.user}`);
          return { ...appointment, tutorProfile: tutor, tutorUser: tutorUser };
        } catch {
          return appointment;
        }
      }));

      setSessions(hydrated);
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
    } catch (cancelError) {
      setError(cancelError.message);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString();
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="sessions-page">Loading sessions...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="sessions-page">
        <section className="sessions-shell">
          <h1>My Sessions</h1>
          {error && <div className="sessions-error">{error}</div>}
          {loading && <p className="sessions-note">Loading sessions...</p>}
          {user.role !== 'student' && <p className="sessions-note">My Sessions is available for student profiles.</p>}
          {!loading && user.role === 'student' && sessions.length === 0 && (
            <p className="sessions-note">No tutor sessions booked yet.</p>
          )}

          <div className="session-list">
            {sessions.map((session) => (
              <div className="session-card" key={session._id}>
                <div>
                  <h2>{session.tutorUser?.username || 'Tutor'}</h2>
                  <p>{session.subject}</p>
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
                <div className="session-actions">
                  {session.tutorProfile && (
                    <Link className="btn btn-primary" to={`/tutors/${session.tutor}`}>
                      Tutor Profile
                    </Link>
                  )}
                  {session.tutorProfile && (
                    <Link className="btn btn-secondary" to={`/messages?with=${session.tutorProfile.user}`}>
                      Message
                    </Link>
                  )}
                  <button className="btn btn-danger" type="button" onClick={() => cancelSession(session._id)}>
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
