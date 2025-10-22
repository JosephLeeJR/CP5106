import React, { useState } from 'react';
import axios from 'axios';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword) {
      setMessage({ type: 'danger', text: 'Please fill in all fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'danger', text: 'New password and confirmation do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'danger', text: 'New password must be at least 6 characters.' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post('/api/auth/change-password', { currentPassword, newPassword });
      setMessage({ type: 'success', text: res.data?.msg || 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.msg || 'Failed to change password.';
      setMessage({ type: 'danger', text: msg });
    }
    setSubmitting(false);
  };

  return (
    <div className="container" style={{ maxWidth: 480, marginTop: '2rem' }}>
      <h1>Change Password</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Updating...' : 'Update Password'}
        </button>
        {message && (
          <div style={{ marginTop: 12, color: message.type === 'success' ? 'green' : 'red' }}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
};

export default ChangePassword;


