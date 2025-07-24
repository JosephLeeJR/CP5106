# VARLABS+: A Scalable Interactive XR Learning Platform

A full-stack web application for student registration and management built with Node.js, Express, MongoDB, and React.

former website: https://varlabs.comp.nus.edu.sg/tutorial/index.html

Mcomp GenTrack Webiste: https://mysoc.nus.edu.sg/app/gentrack/

## Features

- Frontend and Backend separation (MERN Stack)
- User authentication (Register, Login, JWT)
- Student profile management
- Data stored in MongoDB

## Project Structure

```
student-system/
├── backend/         # Express API server
│   ├── controllers/ # Route controllers
│   ├── models/      # MongoDB models
│   ├── middleware/  # Custom middleware
│   ├── routes/      # API routes
│   └── server.js    # Main server file
│
└── frontend/        # React frontend
    ├── public/      # Static files
    └── src/         # React source code
        ├── components/ # Reusable components
        ├── pages/      # Page components
        └── App.js      # Main React component
```

## Setup Instructions

### Prerequisites

- Node.js (v14+)

### Install MongoDB

```
apt install gnupg  
apt install curl  
curl -fsSL https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add -  
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.4 multiverse" \
  | tee /etc/apt/sources.list.d/mongodb-org-4.4.list  
apt update  
apt install mongodb-org  
mongod --config /etc/mongod.conf --fork  
mongosh  
```

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/cp5106
   JWT_SECRET=your_secret_key
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm start
   ```

4. Access the application in your browser at:
   ```
   http://localhost:3000
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user info (requires token)

### User Management

- `GET /api/users` - Get all users (requires token)
- `GET /api/users/:id` - Get specific user (requires token)
- `PUT /api/users/profile` - Update user profile (requires token) 