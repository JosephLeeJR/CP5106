import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Register = ({ register }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: ''
  });

  const navigate = useNavigate();

  const { email, password, password2 } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (password !== password2) {
      alert('Passwords do not match');
      return;
    }

    const success = await register(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Student Registration</h1>
      <p className="auth-subtitle">Create Your Account</p>
      
      <form className="auth-form" onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
            className="form-control"
            placeholder="Enter your email"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
            className="form-control"
            placeholder="Enter password"
            minLength="6"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password2">Confirm Password</label>
          <input
            type="password"
            name="password2"
            value={password2}
            onChange={onChange}
            required
            className="form-control"
            placeholder="Confirm password"
            minLength="6"
          />
        </div>
        
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      
      <p className="auth-redirect">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register; 