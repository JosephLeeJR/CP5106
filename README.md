# VARLABS+: A Scalable Interactive XR Learning Platform

A full-stack web application for student registration and management built with Node.js, Express, MongoDB, and React.

former website: https://varlabs.comp.nus.edu.sg/tutorial/index.html

Mcomp GenTrack Webiste: https://mysoc.nus.edu.sg/app/gentrack/

Admin:e1373369@u.nus.edu

Password:Jimmyli11

## Features

- Modern MERN stack architecture (MongoDB, Express, React, Node.js)
- Complete frontend and backend separation
- Comprehensive user authentication system (Register, Login, JWT)
- Role-based access control (Admin and Regular users)
- Course catalog with admin-managed rich HTML content (create/edit)
- Sequential course unlock based on previous course watch time
- Admin-configurable unlock threshold (seconds)
- Course progress tracking and time recording
- Admin dashboard for monitoring student engagement and batch allowlist upload
- Admin course reordering to control unlock/display sequence
- Persistent data storage with MongoDB

## Project Structure

```
CP5106/
├── backend/         # Express API server
│   ├── models/      # MongoDB models
│   │   ├── User.js         # User schema and model
│   │   ├── Course.js       # Course (title/description/image/content/order)
│   │   ├── CourseTime.js   # Course time tracking per user
│   │   └── Setting.js      # Global settings (e.g., unlock threshold)
│   ├── middleware/  # Custom middleware (auth, admin)
│   ├── routes/      # API routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── users.js        # User management routes
│   │   ├── courses.js      # Course CRUD, progress, time, stats
│   │   └── settings.js     # Global settings (unlock threshold)
│   └── server.js    # Main server file
│
└── frontend/        # React frontend
    ├── public/      # Static files
    └── src/         # React source code
        ├── components/ # Reusable components
        ├── pages/      # Page components (Home, CourseDetails, Dashboard, Admin)
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
- `POST /api/auth/login` - Login and get authentication token
- `GET /api/auth/me` - Get current user info (requires token)

### User Management

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get specific user by ID (requires token)
- `POST /api/users/allowlist` - Upload batch user allowlist (admin only)

### Course Management

- `GET /api/courses` - Get public course list (ordered by unlock/display order)
- `GET /api/courses/:id` - Get public course details (includes HTML content)
- `POST /api/courses` - Create a new course (admin only)
- `PUT /api/courses/:id` - Update an existing course (admin only)
- `PUT /api/courses/reorder/bulk` - Bulk update course order (admin only)
- `GET /api/courses/progress` - Get current user's course progress (requires token)
- `POST /api/courses/time` - Record time spent on a course (requires token)
- `GET /api/courses/stats` - Get course time statistics (admin only)

### Settings

- `GET /api/settings/unlock-threshold` - Get unlock threshold in seconds (requires token)
- `PUT /api/settings/unlock-threshold` - Update unlock threshold (admin only) 