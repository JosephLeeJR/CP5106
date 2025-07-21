import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = ({ user, setUser, showAlert }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email
      });
    }
  }, [user]);

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    try {
      const res = await axios.put('/api/users/profile', formData);
      setUser(res.data);
      showAlert('Profile updated successfully', 'success');
    } catch (err) {
      showAlert(err.response?.data?.msg || 'Error updating profile', 'danger');
    }
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">Edit Your Profile</h1>
      
      <form className="profile-form" onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label>Student ID</label>
          <input
            type="text"
            value={user.studentId}
            className="form-control"
            disabled
          />
          <small className="form-text">Student ID cannot be changed</small>
        </div>
        
        <input type="submit" className="btn" value="Update Profile" />
      </form>
    </div>
  );
};

export default Profile; 