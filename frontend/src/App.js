import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Components
import Navbar from './components/layout/Navbar';
import Alert from './components/layout/Alert';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

// Set default axios settings
axios.defaults.baseURL = 'http://localhost:5000';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const loadUser = async () => {
      if (token) {
        setAuthToken(token);
        try {
          const res = await axios.get('/api/auth/me');
          setUser(res.data);
          setIsAdmin(res.data.isAdmin);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAdmin(false);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Set token in headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      setToken(res.data.token);
      return true;
    } catch (err) {
      showAlert(err.response?.data?.msg || 'Login failed', 'danger');
      return false;
    }
  };

  // Register user
  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      setToken(res.data.token);
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error 
        ? `${err.response.data.msg}: ${err.response.data.error}`
        : err.response?.data?.msg || 'Registration failed';
      showAlert(errorMsg, 'danger');
      return false;
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
  };

  // Show alert
  const showAlert = (msg, type, timeout = 5000) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), timeout);
  };

  // Route protection
  const PrivateRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  // Admin route protection
  const AdminRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    return isAuthenticated && isAdmin ? children : <Navigate to="/" />;
  };

  return (
    <Router>
      <div className="App">
        <Navbar isAuthenticated={isAuthenticated} user={user} logout={logout} isAdmin={isAdmin} />
        <div className="container">
          {alert && <Alert alert={alert} />}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/register" 
              element={!isAuthenticated ? <Register register={register} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login login={login} /> : <Navigate to="/" />} 
            />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard user={user} />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App; 