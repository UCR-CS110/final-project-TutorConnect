import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/pages/EditAccount.css';

const API_URL = 'http://localhost:5001/api';

function EditAccount() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', school: '' });
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

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

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) {
          navigate('/login');
          return;
        }

        const freshUser = await request('/auth/me');
        localStorage.setItem('user', JSON.stringify(freshUser));
        setUser(freshUser);
        setForm({
          username: freshUser.username || '',
          email: freshUser.email || '',
          school: freshUser.school || ''
        });
      } catch (loadError) {
        setError(loadError.message);
      }
    };

    loadAccount();
  }, [navigate, request]);

  const saveAccount = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: form.username,
        email: form.email
      };

      if (user.role === 'student') {
        payload.school = form.school;
      }

      const data = await request('/user/', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setStatus('Account updated successfully.');
      setError('');
      setTimeout(() => navigate('/profile'), 700);
    } catch (saveError) {
      setError(saveError.message);
      setStatus('');
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="edit-account-page">Loading account...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="edit-account-page">
        <div className="edit-account-card">
          <h1>Edit Account</h1>
          {status && <div className="edit-success">{status}</div>}
          {error && <div className="edit-error">{error}</div>}

          <form className="edit-account-form" onSubmit={saveAccount}>
            <div className="form-group">
              <label htmlFor="edit-username">Username</label>
              <input
                id="edit-username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-email">Email</label>
              <input
                id="edit-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            {user.role === 'student' && (
              <div className="form-group">
                <label htmlFor="edit-school">School or University</label>
                <input
                  id="edit-school"
                  value={form.school}
                  onChange={(e) => setForm({ ...form, school: e.target.value })}
                />
              </div>
            )}

            <div className="edit-actions">
              <button className="btn btn-primary" type="submit">Save Account</button>
              <button className="btn btn-secondary" type="button" onClick={() => navigate('/profile')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditAccount;
