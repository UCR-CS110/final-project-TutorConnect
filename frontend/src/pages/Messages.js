import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { formatSubject } from '../constants/subjects';
import {
  compareAppointmentsByStart,
  formatStoredDate,
  getStoredDateInputValue,
  isCompletedConfirmedAppointment,
  isUpcomingAppointment
} from '../utils/appointments';
import '../styles/pages/Messages.css';

const API_URL = 'http://localhost:5001/api';

const formatDate = (date) => {
  return formatStoredDate(date, 'a future date');
};

const getAppointmentNotice = (appointment, partner) => {
  if (!appointment || !partner) return '';

  const location = appointment.location || 'online';
  return `You have an appointment with ${partner.username} on ${formatDate(appointment.date)} from ${appointment.startTime} to ${appointment.endTime} (${location}) for tutoring in ${formatSubject(appointment.subject)}.`;
};

const normalizeId = (id) => String(id || '');

const matchesAvailabilitySlot = (appointment, availability = []) => availability.some((slot) => (
  getStoredDateInputValue(slot.date) === getStoredDateInputValue(appointment.date)
  && slot.startTime === appointment.startTime
  && slot.endTime === appointment.endTime
  && (slot.meetingType === 'both' || slot.meetingType === appointment.location)
));

const isConfirmedAppointment = (appointment) => Boolean(appointment.confirmed || appointment.availability || appointment.availabilityBacked);

function Messages() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [ratingForms, setRatingForms] = useState({});
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

  const loadConversation = useCallback(async (partnerId) => {
    if (!partnerId) return;
    const data = await request(`/message/${partnerId}`);
    setMessages(data.messages || []);
    setActivePartner(data.partner);
  }, [request]);

  const loadData = useCallback(async () => {
    try {
      const me = await request('/auth/me');
      setUser(me);
      localStorage.setItem('user', JSON.stringify(me));

      const conversationData = await request('/message/conversations');
      setConversations(conversationData.conversations || []);

      const selectedPartnerId = searchParams.get('with') || conversationData.conversations?.[0]?._id;
      if (selectedPartnerId) {
        await loadConversation(selectedPartnerId);
      }

      const appointmentData = await request('/user/appointments');
      const studentAppointments = await Promise.all((appointmentData.appointments || []).filter(isUpcomingAppointment).map(async (appointment) => {
        try {
          const tutor = await request(`/tutor/info/${appointment.tutor}`);
          const availabilityData = await request(`/tutor/availability/${appointment.tutor}`);
          return {
            ...appointment,
            partnerId: normalizeId(tutor.user),
            availabilityBacked: matchesAvailabilitySlot(appointment, availabilityData.availability || [])
          };
        } catch {
          return appointment;
        }
      }));
      const confirmedStudentAppointments = studentAppointments.filter(isConfirmedAppointment);

      const tutorAppointments = await Promise.all((appointmentData.tutoring || []).map(async (appointment) => {
        try {
          const availabilityData = await request(`/tutor/availability/${appointment.tutor}`);
          return {
            ...appointment,
            partnerId: normalizeId(appointment.student),
            availabilityBacked: matchesAvailabilitySlot(appointment, availabilityData.availability || [])
          };
        } catch {
          return {
            ...appointment,
            partnerId: normalizeId(appointment.student)
          };
        }
      }));

      const confirmedTutorAppointments = tutorAppointments.filter((appointment) => (
        isConfirmedAppointment(appointment) && isUpcomingAppointment(appointment)
      ));

      setConfirmedAppointments([...confirmedStudentAppointments, ...confirmedTutorAppointments].sort(compareAppointmentsByStart));

      if (me.role === 'tutor') {
        const tutoring = (appointmentData.tutoring || []).filter(isCompletedConfirmedAppointment);
        const hydrated = await Promise.all(tutoring.map(async (appointment) => {
          try {
            const student = await request(`/user/${appointment.student}`);
            return { ...appointment, studentInfo: student };
          } catch {
            return appointment;
          }
        }));
        setAppointments(hydrated);
      }
    } catch (loadError) {
      if (loadError.message === 'Not logged in') {
        navigate('/login');
      } else {
        setError(loadError.message);
      }
    }
  }, [loadConversation, navigate, request, searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectConversation = (partnerId) => {
    setSearchParams({ with: partnerId });
    loadConversation(partnerId);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!activePartner) return;

    try {
      await request('/message/', {
        method: 'POST',
        body: JSON.stringify({ recipientId: activePartner._id, body: messageText })
      });
      setMessageText('');
      setStatus('');
      setError('');
      await loadConversation(activePartner._id);
      const conversationData = await request('/message/conversations');
      setConversations(conversationData.conversations || []);
    } catch (sendError) {
      setError(sendError.message);
      setStatus('');
    }
  };

  const updateRatingForm = (studentId, field, value) => {
    setRatingForms((forms) => ({
      ...forms,
      [studentId]: {
        rating: '5',
        comment: '',
        ...(forms[studentId] || {}),
        [field]: value
      }
    }));
  };

  const rateStudent = async (e, studentId) => {
    e.preventDefault();
    const ratingForm = ratingForms[studentId] || {};

    try {
      await request('/student-review/', {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          rating: Number(ratingForm.rating || 5),
          comment: ratingForm.comment || ''
        })
      });
      setStatus('Student rating submitted.');
      setError('');
      setRatingForms((forms) => ({ ...forms, [studentId]: undefined }));
    } catch (ratingError) {
      setError(ratingError.message);
      setStatus('');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const uniqueStudentAppointments = appointments.filter((appointment, index, list) => (
    list.findIndex((item) => item.student === appointment.student) === index
  ));
  const activeAppointment = activePartner
    ? confirmedAppointments.find((appointment) => normalizeId(appointment.partnerId) === normalizeId(activePartner._id))
    : null;

  return (
    <>
      <Navbar />
      <div className="messages-page">
        <div className="messages-layout">
          <aside className="conversation-list">
            <h2>Messages</h2>
            {conversations.length === 0 && <p>No conversations yet.</p>}
            {conversations.map((conversation) => (
              <button
                className={activePartner?._id === conversation._id ? 'active' : ''}
                key={conversation._id}
                type="button"
                onClick={() => selectConversation(conversation._id)}
              >
                <strong>{conversation.username}</strong>
                <span>{conversation.role}</span>
              </button>
            ))}
          </aside>

          <section className="chat-panel">
            <h1>{activePartner ? activePartner.username : 'Select a conversation'}</h1>
            {status && <div className="messages-success">{status}</div>}
            {error && <div className="messages-error">{error}</div>}
            <div className="chat-thread">
              {activeAppointment && (
                <div className="appointment-notice">
                  {getAppointmentNotice(activeAppointment, activePartner)}
                </div>
              )}
              {messages.map((message) => (
                <div className={`chat-bubble ${message.sender === user.id ? 'mine' : 'theirs'}`} key={message._id}>
                  <p>{message.body}</p>
                  <span>{new Date(message.createdAt).toLocaleString()}</span>
                </div>
              ))}
              {activePartner && messages.length === 0 && <p className="empty-chat">No messages yet.</p>}
            </div>
            {activePartner && (
              <form className="message-form" onSubmit={sendMessage}>
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message"
                  required
                />
                <button className="btn btn-primary" type="submit">Send</button>
              </form>
            )}
          </section>
        </div>

        {user.role === 'tutor' && (
          <section className="student-rating-panel">
            <h2>Rate Students</h2>
            {uniqueStudentAppointments.length === 0 && <p>Student ratings unlock after a confirmed session has passed.</p>}
            {uniqueStudentAppointments.map((appointment) => {
              const student = appointment.studentInfo;
              const form = ratingForms[appointment.student] || {};
              return (
                <form className="student-rating-card" key={appointment.student} onSubmit={(e) => rateStudent(e, appointment.student)}>
                  <div>
                    <strong>{student?.username || 'Student'}</strong>
                    <span>★ {student && student.numRatings > 0 ? Number(student.ratingAverage || 0).toFixed(1) : 'NA'}</span>
                  </div>
                  <select value={form.rating || '5'} onChange={(e) => updateRatingForm(appointment.student, 'rating', e.target.value)}>
                    <option value="5">5 stars</option>
                    <option value="4">4 stars</option>
                    <option value="3">3 stars</option>
                    <option value="2">2 stars</option>
                    <option value="1">1 star</option>
                  </select>
                  <input
                    value={form.comment || ''}
                    onChange={(e) => updateRatingForm(appointment.student, 'comment', e.target.value)}
                    placeholder="Feedback"
                  />
                  <button className="btn btn-secondary" type="submit">Rate</button>
                </form>
              );
            })}
          </section>
        )}
      </div>
    </>
  );
}

export default Messages;
