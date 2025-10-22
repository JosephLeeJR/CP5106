import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseStats, setCourseStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'courseStats' | 'settings' | 'courses'
  const [userQuery, setUserQuery] = useState('');
  const [userAdminFilter, setUserAdminFilter] = useState('all'); // all | admin | nonadmin
  const [userYearFilter, setUserYearFilter] = useState('');
  const [userSemesterFilter, setUserSemesterFilter] = useState('');
  const [userCoursecodeFilter, setUserCoursecodeFilter] = useState('');
  const [userSort, setUserSort] = useState({ key: 'dateCreated', dir: 'desc' });

  const [allowlistText, setAllowlistText] = useState('');
  const [allowlistFile, setAllowlistFile] = useState(null);
  const [allowlistMsg, setAllowlistMsg] = useState(null);
  const [allowlistUploading, setAllowlistUploading] = useState(false);

  const [unlockThreshold, setUnlockThreshold] = useState(120);
  const [settingsMsg, setSettingsMsg] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Courses tab state
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseImage, setNewCourseImage] = useState('');
  const [newCourseContent, setNewCourseContent] = useState(''); // HTML
  const [courseSubmitMsg, setCourseSubmitMsg] = useState(null);
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [existingCourses, setExistingCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Edit mode state
  const [editingId, setEditingId] = useState('');
  const [editMsg, setEditMsg] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  // Reorder state
  const [reorderMsg, setReorderMsg] = useState(null);
  const [reorderSaving, setReorderSaving] = useState(false);

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

  const normalizedIncludes = (text, query) => {
    return String(text || '')
      .toLowerCase()
      .includes(String(query || '').toLowerCase());
  };

  const getFilteredSortedUsers = () => {
    let list = Array.isArray(users) ? [...users] : [];

    // filter by admin status
    if (userAdminFilter === 'admin') {
      list = list.filter(u => !!u.isAdmin);
    } else if (userAdminFilter === 'nonadmin') {
      list = list.filter(u => !u.isAdmin);
    }

    // filter by year
    if (userYearFilter && userYearFilter.trim()) {
      list = list.filter(u => normalizedIncludes(u.year, userYearFilter));
    }

    // filter by semester
    if (userSemesterFilter && userSemesterFilter.trim()) {
      list = list.filter(u => String(u.semester || '') === String(userSemesterFilter));
    }

    // filter by coursecode
    if (userCoursecodeFilter && userCoursecodeFilter.trim()) {
      list = list.filter(u => normalizedIncludes(u.coursecode, userCoursecodeFilter));
    }

    // search query across name, email, year, and coursecode
    if (userQuery && userQuery.trim()) {
      const q = userQuery.trim();
      list = list.filter(u => 
        normalizedIncludes(u.name, q) || 
        normalizedIncludes(u.email, q) ||
        normalizedIncludes(u.year, q) ||
        normalizedIncludes(u.coursecode, q)
      );
    }

    // sort
    const { key, dir } = userSort || {};
    const factor = dir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      let av = a?.[key];
      let bv = b?.[key];
      if (key === 'dateCreated') {
        av = new Date(a?.dateCreated || 0).getTime();
        bv = new Date(b?.dateCreated || 0).getTime();
      } else if (key === 'isAdmin') {
        av = a?.isAdmin ? 1 : 0;
        bv = b?.isAdmin ? 1 : 0;
      } else if (key === 'semester') {
        av = Number(a?.semester || 0);
        bv = Number(b?.semester || 0);
      } else {
        av = String(av || '').toLowerCase();
        bv = String(bv || '').toLowerCase();
      }
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return 0;
    });

    return list;
  };

  const toggleSort = (key) => {
    setUserSort(prev => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' };
      return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
    });
  };

  useEffect(() => {
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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const res = await axios.get('/api/courses');
        setExistingCourses(res.data || []);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setCoursesLoading(false);
      }
    };

    if (activeTab === 'courses') {
      fetchCourses();
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

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCourseSubmitMsg(null);
    setCourseSubmitting(true);
    try {
      const payload = {
        title: newCourseTitle.trim(),
        description: newCourseDesc.trim(),
        image: newCourseImage.trim() || undefined,
        content: newCourseContent
      };
      const res = await axios.post('/api/courses', payload);
      setCourseSubmitMsg(res.data?.msg || 'Course created successfully');
      setNewCourseTitle('');
      setNewCourseDesc('');
      setNewCourseImage('');
      setNewCourseContent('');
      // refresh list
      try {
        const listRes = await axios.get('/api/courses');
        setExistingCourses(listRes.data || []);
      } catch {}
    } catch (err) {
      setCourseSubmitMsg(err.response?.data?.msg || 'Failed to create course');
    }
    setCourseSubmitting(false);
  };

  const startEditing = async (id) => {
    setEditMsg(null);
    setEditingId(id);
    try {
      const res = await axios.get(`/api/courses/${id}`);
      setNewCourseTitle(res.data?.title || '');
      setNewCourseDesc(res.data?.description || '');
      setNewCourseImage(res.data?.image || '');
      setNewCourseContent(res.data?.content || '');
    } catch (err) {
      setEditMsg('Failed to load course for editing');
    }
  };

  const cancelEditing = () => {
    setEditingId('');
    setEditMsg(null);
    setNewCourseTitle('');
    setNewCourseDesc('');
    setNewCourseImage('');
    setNewCourseContent('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setEditSaving(true);
    setEditMsg(null);
    try {
      const payload = {
        title: newCourseTitle,
        description: newCourseDesc,
        image: newCourseImage,
        content: newCourseContent
      };
      const res = await axios.put(`/api/courses/${editingId}`, payload);
      // Refresh list first
      try {
        const listRes = await axios.get('/api/courses');
        setExistingCourses(listRes.data || []);
      } catch {}
      // Popup success and reset to default state
      window.alert(res.data?.msg || 'Course updated successfully');
      cancelEditing();
    } catch (err) {
      setEditMsg(err.response?.data?.msg || 'Failed to update course');
    }
    setEditSaving(false);
  };

  const moveCourse = (idx, delta) => {
    const newIdx = idx + delta;
    if (newIdx < 0 || newIdx >= existingCourses.length) return;
    const list = [...existingCourses];
    const tmp = list[idx];
    list[idx] = list[newIdx];
    list[newIdx] = tmp;
    setExistingCourses(list);
  };

  const saveReorder = async () => {
    setReorderMsg(null);
    setReorderSaving(true);
    try {
      const payload = {
        order: existingCourses.map((c, index) => ({ id: c.id, order: index }))
      };
      const res = await axios.put('/api/courses/reorder/bulk', payload);
      setReorderMsg(res.data?.msg || 'Order saved successfully');
      // refetch to ensure consistent order from backend
      try {
        const listRes = await axios.get('/api/courses');
        setExistingCourses(listRes.data || []);
      } catch {}
    } catch (err) {
      setReorderMsg(err.response?.data?.msg || 'Failed to save order');
    }
    setReorderSaving(false);
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
          Lesson Statistics
        </button>
        <button 
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`} 
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button 
          className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`} 
          onClick={() => setActiveTab('courses')}
        >
          Lessons
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="admin-card">
          <h2>Batch Upload Allowlist (CSV)</h2>
          <form onSubmit={handleAllowlistUpload} style={{ marginBottom: '1rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Paste allowlist CSV (header: name,email,year,semester,coursecode):</label>
              <textarea
                value={allowlistText}
                onChange={handleAllowlistTextChange}
                rows={5}
                style={{ width: '100%', marginTop: 4 }}
                placeholder={"name,email,year,semester,coursecode\nJoseph Lee,e1373369@u.nus.edu,2024,1,CP5106\nLi Minghao,e1373370@u.nus.edu,2024,2,CP5106"}
              />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Or upload a .csv file:</label>
              <input type="file" accept=".csv" onChange={handleAllowlistFileChange} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={allowlistUploading}>
              {allowlistUploading ? 'Uploading...' : 'Upload Allowlist'}
            </button>
            {allowlistMsg && <div style={{ marginTop: 8, color: allowlistMsg.toLowerCase().includes('success') ? 'green' : 'red' }}>{allowlistMsg}</div>}
          </form>
          <h2>User List</h2>
          <p>Total users in system: {users.length}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search by name, email, year, or coursecode"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                style={{ flex: 1, minWidth: 220 }}
              />
              <select value={userAdminFilter} onChange={(e) => setUserAdminFilter(e.target.value)}>
                <option value="all">All Users</option>
                <option value="admin">Admins</option>
                <option value="nonadmin">Non-admins</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Filter by year"
                value={userYearFilter}
                onChange={(e) => setUserYearFilter(e.target.value)}
                style={{ width: 120 }}
              />
              <select value={userSemesterFilter} onChange={(e) => setUserSemesterFilter(e.target.value)} style={{ width: 120 }}>
                <option value="">All Semesters</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
              <input
                type="text"
                placeholder="Filter by coursecode"
                value={userCoursecodeFilter}
                onChange={(e) => setUserCoursecodeFilter(e.target.value)}
                style={{ width: 150 }}
              />
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>Sort:</span>
                <select
                  value={userSort?.key}
                  onChange={(e) => setUserSort({ key: e.target.value, dir: 'asc' })}
                >
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="year">Year</option>
                  <option value="semester">Semester</option>
                  <option value="coursecode">Coursecode</option>
                  <option value="dateCreated">Registered</option>
                  <option value="isAdmin">Admin</option>
                </select>
                <button className="btn btn-sm" onClick={() => setUserSort(prev => ({ key: prev.key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }))}>
                  {userSort?.dir === 'asc' ? 'Asc' : 'Desc'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('_id')}>ID</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('name')}>Name</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('email')}>Email</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('year')}>Year</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('semester')}>Semester</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('coursecode')}>Coursecode</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('dateCreated')}>Registration Date</th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('isAdmin')}>Admin</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredSortedUsers().map(user => (
                  <tr key={user._id}>
                    <td>{user._id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.year || '-'}</td>
                    <td>{user.semester || '-'}</td>
                    <td>{user.coursecode || '-'}</td>
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
          <h2>Lesson Time Statistics</h2>
          {statsLoading ? (
            <div className="loading">Loading statistics...</div>
          ) : courseStats.length === 0 ? (
            <div className="no-data">No lesson activity data available yet.</div>
          ) : (
            <div className="stats-container">
              <div className="user-table-container">
                <table className="user-table stats-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Lesson</th>
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

      {activeTab === 'courses' && (
        <div className="admin-card">
          <h2>{editingId ? 'Edit Lesson' : 'Create Lesson'}</h2>
          <form onSubmit={editingId ? handleSaveEdit : handleCreateCourse}>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Title:</label>
              <input 
                type="text"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                style={{ marginLeft: 8, width: '60%' }}
                placeholder="Enter lesson title"
                required
              />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Description:</label>
              <input 
                type="text"
                value={newCourseDesc}
                onChange={(e) => setNewCourseDesc(e.target.value)}
                style={{ marginLeft: 8, width: '80%' }}
                placeholder="Short description for the lesson"
                required
              />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Image URL:</label>
              <input 
                type="text"
                value={newCourseImage}
                onChange={(e) => setNewCourseImage(e.target.value)}
                style={{ marginLeft: 8, width: '80%' }}
                placeholder="https://..."
              />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Content (HTML):</label>
              <textarea 
                value={newCourseContent}
                onChange={(e) => setNewCourseContent(e.target.value)}
                rows={10}
                style={{ display: 'block', width: '100%', marginTop: 4 }}
                placeholder="<h2>Title</h2>\n<p>Rich HTML content here...</p>"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button type="submit" className="btn btn-primary" disabled={editingId ? editSaving : courseSubmitting}>
                {editingId ? (editSaving ? 'Saving...' : 'Save Changes') : (courseSubmitting ? 'Creating...' : 'Create Lesson')}
              </button>
              {editingId && (
                <button type="button" className="btn" onClick={cancelEditing}>Cancel</button>
              )}
            </div>
            {(courseSubmitMsg && !editingId) && <div style={{ marginTop: 8 }}>{courseSubmitMsg}</div>}
            {(editMsg && editingId) && <div style={{ marginTop: 8 }}>{editMsg}</div>}
          </form>

          <h2 style={{ marginTop: '1.5rem' }}>Existing Lessons</h2>
          {coursesLoading ? (
            <div className="loading">Loading lessons...</div>
          ) : (
            <div className="user-table-container">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {existingCourses.map((c, idx) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.title}</td>
                      <td>{c.description}</td>
                      <td style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm" onClick={() => startEditing(c.id)}>Edit</button>
                        <button className="btn btn-sm" onClick={() => moveCourse(idx, -1)} disabled={idx === 0}>↑</button>
                        <button className="btn btn-sm" onClick={() => moveCourse(idx, 1)} disabled={idx === existingCourses.length - 1}>↓</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="btn btn-primary" onClick={saveReorder} disabled={reorderSaving}>
                  {reorderSaving ? 'Saving...' : 'Save Order'}
                </button>
                {reorderMsg && <span>{reorderMsg}</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin; 