import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseStats, setCourseStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'courseStats' | 'settings'

  const [allowlistText, setAllowlistText] = useState('');
  const [allowlistFile, setAllowlistFile] = useState(null);
  const [allowlistMsg, setAllowlistMsg] = useState(null);
  const [allowlistUploading, setAllowlistUploading] = useState(false);

  const [unlockThreshold, setUnlockThreshold] = useState(120);
  const [settingsMsg, setSettingsMsg] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

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

  useEffect(() => {
    // Fetch course time statistics
    const fetchCourseStats = async () => {
      try {
        setStatsLoading(true);
        const res = await axios.get('/api/courses/stats');
        setCourseStats(res.data);
      } catch (err) {
        console.error('Failed to fetch course statistics:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    if (activeTab === 'courseStats') {
      fetchCourseStats();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true);
        const res = await axios.get('/api/settings/unlock-threshold');
        const value = Number(res.data?.value);
        if (Number.isFinite(value)) {
          setUnlockThreshold(value);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setSettingsLoading(false);
      }
    };

    if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab]);

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

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    setSettingsMsg(null);
    try {
      const res = await axios.put('/api/settings/unlock-threshold', { value: Number(unlockThreshold) });
      setSettingsMsg(res.data?.msg || 'Settings saved successfully');
    } catch (err) {
      setSettingsMsg(err.response?.data?.msg || 'Failed to save settings');
    }
  };

  // Format duration in seconds to mm:ss or hh:mm:ss
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
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
      
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`} 
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`tab-button ${activeTab === 'courseStats' ? 'active' : ''}`} 
          onClick={() => setActiveTab('courseStats')}
        >
          Course Statistics
        </button>
        <button 
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`} 
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {activeTab === 'users' && (
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
      )}

      {activeTab === 'courseStats' && (
        <div className="admin-card">
          <h2>Course Time Statistics</h2>
          {statsLoading ? (
            <div className="loading">Loading statistics...</div>
          ) : courseStats.length === 0 ? (
            <div className="no-data">No course activity data available yet.</div>
          ) : (
            <div className="stats-container">
              <div className="user-table-container">
                <table className="user-table stats-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Total Time</th>
                      <th>Last Visit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseStats.map((stat, index) => (
                      <tr key={index}>
                        <td>{stat.userName}</td>
                        <td>{stat.userEmail}</td>
                        <td>{stat.courseName}</td>
                        <td>{formatDuration(stat.totalDuration)}</td>
                        <td>{new Date(stat.lastVisit).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="admin-card">
          <h2>Settings</h2>
          <form onSubmit={handleSettingsSave}>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Unlock threshold (seconds):</label>
              <input 
                type="number" 
                min="0" 
                value={unlockThreshold}
                onChange={(e) => setUnlockThreshold(e.target.value)}
                style={{ marginLeft: 8 }}
              />
            </div>
            <button type="submit" className="btn btn-primary">Save Settings</button>
            {settingsLoading && <div className="loading" style={{ marginTop: 8 }}>Loading current settings...</div>}
            {settingsMsg && <div style={{ marginTop: 8 }}>{settingsMsg}</div>}
          </form>
        </div>
      )}
    </div>
  );
};

export default Admin; 