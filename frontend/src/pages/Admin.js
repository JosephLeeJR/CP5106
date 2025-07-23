import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [allowlistText, setAllowlistText] = useState('');
  const [allowlistFile, setAllowlistFile] = useState(null);
  const [allowlistMsg, setAllowlistMsg] = useState(null);
  const [allowlistUploading, setAllowlistUploading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users');
        setUsers(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAllowlistTextChange = (e) => {
    setAllowlistText(e.target.value);
  };

  const handleAllowlistFileChange = (e) => {
    setAllowlistFile(e.target.files[0]);
  };

  const handleAllowlistUpload = async (e) => {
    e.preventDefault();
    setAllowlistUploading(true);
    setAllowlistMsg(null);
    try {
      let res;
      if (allowlistFile) {
        const formData = new FormData();
        formData.append('file', allowlistFile);
        res = await axios.post('/api/users/allowlist', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (allowlistText.trim()) {
        res = await axios.post('/api/users/allowlist', { text: allowlistText });
      } else {
        setAllowlistMsg('Please provide text or upload a file.');
        setAllowlistUploading(false);
        return;
      }
      setAllowlistMsg(res.data.msg + (res.data.count ? ` (${res.data.count} entries)` : ''));
      setAllowlistText('');
      setAllowlistFile(null);
    } catch (err) {
      setAllowlistMsg(err.response?.data?.msg || 'Upload failed');
    }
    setAllowlistUploading(false);
  };

  if (loading) {
    return (
      <div className="admin-container">
        <h1>Admin Dashboard</h1>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <h1>Admin Dashboard</h1>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <div className="admin-card">
        <h2>Batch Upload Allowlist</h2>
        <form onSubmit={handleAllowlistUpload} style={{ marginBottom: '1rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>Paste allowlist (one per line: Name,Email):</label>
            <textarea
              value={allowlistText}
              onChange={handleAllowlistTextChange}
              rows={5}
              style={{ width: '100%', marginTop: 4 }}
              placeholder={"e.g.\nJoseph Lee,e1373369@u.nus.edu\nLi Minghao,e1373370@u.nus.edu"}
            />
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>Or upload a .txt file:</label>
            <input type="file" accept=".txt" onChange={handleAllowlistFileChange} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={allowlistUploading}>
            {allowlistUploading ? 'Uploading...' : 'Upload Allowlist'}
          </button>
          {allowlistMsg && <div style={{ marginTop: 8, color: allowlistMsg.toLowerCase().includes('success') ? 'green' : 'red' }}>{allowlistMsg}</div>}
        </form>
        <h2>User List</h2>
        <p>Total users in system: {users.length}</p>
        
        <div className="user-table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Registration Date</th>
                <th>Admin</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.dateCreated).toLocaleString()}</td>
                  <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin; 