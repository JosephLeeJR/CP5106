# Student Management System

A full-stack web application for student registration and management built with Node.js, Express, MongoDB, and React.

former website: https://varlabs.comp.nus.edu.sg/tutorial/index.html
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
- MongoDB (Make sure MongoDB server is running)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd student-system/backend
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
   cd student-system/frontend
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