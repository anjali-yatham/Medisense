# 🏥 MediSense - Smart Medicine Management System

[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24.11+-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A comprehensive healthcare management platform that enables patients to track their medications, doctors to manage prescriptions, and provides intelligent OCR-based prescription scanning with automated reminders.

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Features in Detail](#features-in-detail)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

MediSense is a full-stack medicine management application designed to bridge the gap between healthcare providers and patients. It offers a seamless experience for prescription management, medication tracking, and automated health reminders.

### Problem Statement
- Patients forget to take medicines on time
- Difficulty in tracking multiple medications
- Manual prescription entry is time-consuming
- Poor medication adherence leads to health complications

### Solution
MediSense provides an intelligent platform with:
- **OCR-powered prescription scanning** for instant data entry
- **Smart medication reminders** based on meal timings
- **Comprehensive tracking** of medicine intake with adherence reports
- **Multi-role access** for patients, doctors, and super admins

## ✨ Key Features

### 👤 For Patients (Users)
- 📱 **Dashboard**: View daily medicine schedule at a glance
- 💊 **Medicine Tracking**: Mark medicines as taken/missed with one click
- 📊 **Adherence Reports**: Visual charts showing medicine intake patterns
- 🔔 **Smart Notifications**: Automated reminders at scheduled times
- 📋 **Prescription History**: Access all past prescriptions
- 👨‍👩‍👧 **Family Management**: Add emergency contacts and family members
- 📱 **Profile Management**: Complete user profile with health information
- 📈 **Analytics**: Detailed reports on medication adherence with PDF export

### 👨‍⚕️ For Doctors (Organizations)
- 📝 **Create Prescriptions**: Easy prescription creation with patient search
- 🤖 **OCR Scanning**: Upload prescription images and auto-fill medicine details
- 🔍 **Medicine Database**: Search from 200+ pre-loaded medicines
- 👥 **Patient Management**: View and manage patient prescriptions
- 📊 **View History**: Access patient prescription history
- 🗄️ **Med Database Access**: Comprehensive medicine information database

### 🔐 For Super Admin
- 👥 **User Management**: View and manage all users
- 🏢 **Organization Management**: Approve/manage healthcare organizations
- 📊 **System Analytics**: Platform-wide usage statistics
- 🔧 **System Configuration**: Platform settings and controls

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Data visualization for reports
- **jsPDF** - PDF report generation
- **Vite** - Build tool and dev server

### Backend
- **Node.js v24.11** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication and authorization
- **node-cron** - Scheduled task automation
- **OCR.space API** - Prescription text extraction

### Development Tools
- **Nodemon** - Auto-restart server on changes
- **ESLint** - Code linting
- **Git** - Version control

## 📁 Project Structure

```
zignasa/
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx           # Navigation header with dropdown
│   │   │   ├── Home.jsx             # Dashboard with daily schedule
│   │   │   ├── Signin.jsx           # User authentication
│   │   │   ├── Signup.jsx           # User registration
│   │   │   ├── Profile.jsx          # User profile management
│   │   │   ├── Medicines.jsx        # Medicine list view
│   │   │   ├── Prescriptions.jsx    # Prescription management + OCR
│   │   │   ├── TrackMedicines.jsx   # Medicine tracking interface
│   │   │   ├── Reports.jsx          # Adherence reports & analytics
│   │   │   ├── MedDatabase.jsx      # Medicine database search
│   │   │   ├── SuperAdminLogin.jsx  # Admin authentication
│   │   │   └── SuperAdminDashboard.jsx # Admin panel
│   │   ├── App.jsx                  # Main app component with routing
│   │   ├── main.jsx                 # React entry point
│   │   └── App.css                  # Global styles
│   ├── index.html                   # HTML template
│   ├── vite.config.js               # Vite configuration
│   └── package.json                 # Frontend dependencies
│
├── server/                          # Backend Node.js application
│   ├── models/
│   │   ├── User.js                  # User schema with profile data
│   │   ├── Medicine.js              # Medicine tracking schema
│   │   ├── Prescription.js          # Prescription schema
│   │   ├── Notification.js          # Notification schema
│   │   └── MedDatabase.js           # Medicine database schema
│   ├── routes/
│   │   ├── auth.js                  # Authentication endpoints
│   │   ├── admin.js                 # Super admin endpoints
│   │   ├── medicine.js              # Medicine CRUD + tracking
│   │   ├── prescription.js          # Prescription management
│   │   ├── notification.js          # Notification endpoints
│   │   ├── medDatabase.js           # Medicine database API
│   │   ├── profile.js               # User profile endpoints
│   │   └── ocr.js                   # OCR text extraction
│   ├── services/
│   │   └── cronService.js           # Automated reminders & resets
│   ├── seedMedicines.js             # Database seeder (200 medicines)
│   ├── server.js                    # Express app entry point
│   ├── .env                         # Environment variables
│   └── package.json                 # Backend dependencies
│
└── README.md                        # Project documentation
```

## 🚀 Installation

### Prerequisites
- Node.js v24.11 or higher
- MongoDB Atlas account (or local MongoDB)
- npm or yarn package manager

### Step 1: Clone the Repository
```bash
git clone https://github.com/askarthikey/zignasa.git
cd zignasa
```

### Step 2: Install Backend Dependencies
```bash
cd server
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../client
npm install
```

### Step 4: Configure Environment Variables
Create a `.env` file in the `server/` directory:

```env
DB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=4000
OCR_SPACE_API_KEY=K87899142388957
```

### Step 5: Seed Medicine Database (Optional)
```bash
cd server
node seedMedicines.js
```

### Step 6: Start the Application

**Terminal 1 - Backend:**
```bash
cd server
nodemon server.js
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## 🔐 Environment Variables

### Server (.env)
```env
DB_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_secret_key_here
PORT=4000
OCR_SPACE_API_KEY=your_ocr_api_key_here
```

### Client (.env)
```env
VITE_API_URL=http://localhost:4000
```

## 📱 Usage

### For Patients

1. **Sign Up**: Create an account with email and password
2. **Complete Profile**: Add personal details, emergency contacts, and family members
3. **View Dashboard**: See today's medicine schedule
4. **Track Medicines**: Mark medicines as taken or missed
5. **View Reports**: Check adherence statistics and download PDF reports

### For Doctors

1. **Sign Up as Organization**: Register with organization details
2. **Create Prescription**: 
   - Search for patient by name/email
   - Upload prescription image (OCR auto-fills)
   - Or manually enter medicine details
   - Set dosage timings and duration
3. **View Prescriptions**: Access patient prescription history
4. **Search Medicine Database**: Find medicines by name, composition, or manufacturer

### For Super Admin

1. **Login**: Use super admin credentials
2. **Manage Users**: View all patients and organizations
3. **System Overview**: Monitor platform usage and statistics

## 🔌 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "userType": "user"
}
```

#### POST `/api/auth/signin`
User login
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Medicine Endpoints

#### GET `/api/medicines/today`
Get today's medicine schedule (requires auth)

#### PUT `/api/medicines/:medicineId/take`
Mark medicine as taken
```json
{
  "timing": "afterBreakfast"
}
```

#### GET `/api/medicines/stats`
Get medicine adherence statistics

#### GET `/api/medicines/medicine-counts`
Get medicine taken/missed counts for reports

### Prescription Endpoints

#### POST `/api/prescriptions/create`
Create new prescription
```json
{
  "patientId": "user_id",
  "medicines": [
    {
      "name": "Paracetamol 500mg",
      "quantity": 10,
      "startDate": "2025-11-28",
      "endDate": "2025-12-05",
      "timing": {
        "afterBreakfast": true,
        "afterDinner": true
      }
    }
  ]
}
```

#### GET `/api/prescriptions/patient-prescriptions`
Get all prescriptions for logged-in patient

### OCR Endpoint

#### POST `/api/ocr/extract`
Extract text from prescription image
```json
{
  "image": "base64_encoded_image"
}
```

### Profile Endpoints

#### GET `/api/profile`
Get user profile

#### PUT `/api/profile`
Update user profile
```json
{
  "age": 30,
  "bloodGroup": "O+",
  "address": "123 Main St",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "9876543210",
    "relationship": "Spouse"
  },
  "familyMembers": [
    {
      "name": "Child Name",
      "relation": "Son",
      "contact": "1231231234"
    }
  ]
}
```

## 🎯 Features in Detail

### 1. OCR Prescription Scanning
- **Upload**: Take a photo or upload prescription image
- **Process**: OCR.space API extracts text with 95%+ accuracy
- **Parse**: Intelligent parsing identifies:
  - Medicine names
  - Dosage quantities (1-0-1 format)
  - Duration (days/weeks/months)
  - Timing instructions
- **Verify**: User can review and edit extracted data
- **Submit**: Creates prescription with all medicines

### 2. Smart Medicine Reminders
Automated cron jobs run at specific times:
- **Before Breakfast**: 7:30 AM
- **After Breakfast**: 8:30 AM
- **Before Lunch**: 12:30 PM
- **After Lunch**: 1:30 PM
- **Before Dinner**: 7:30 PM
- **After Dinner**: 8:30 PM

Daily reset at midnight clears "taken" status for next day.

### 3. Medicine Tracking
- Real-time status updates (taken/missed)
- Color-coded indicators (green/red)
- One-click mark as taken
- Undo functionality
- Quantity depletion tracking
- Low stock alerts

### 4. Adherence Reports
- **Visual Analytics**:
  - Bar charts (taken vs missed by medicine)
  - Doughnut charts (overall adherence rate)
- **Statistics**:
  - Total medicines tracked
  - Doses taken/missed
  - Adherence percentage
  - Most missed medicine alerts
- **PDF Export**: Download detailed reports

### 5. Medicine Database
- 200+ medicines pre-loaded
- Search by:
  - Medicine name
  - Composition
  - Category
  - Manufacturer
- Public access (no auth required)
- Used in prescription creation

### 6. User Profile Management
- Personal information
- Emergency contact details
- Multiple family members
- Health information (age, blood group, address)
- Profile photo (avatar with initials)
- Full CRUD operations

### 7. Multi-Role Access Control
- **User (Patient)**: Full medicine tracking access
- **Organization (Doctor)**: Prescription management
- **Super Admin**: System administration
- JWT-based authentication
- Role-based route protection

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  userType: Enum ['user', 'organisation', 'superadmin'],
  age: Number,
  bloodGroup: String,
  address: String,
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  familyMembers: [{
    name: String,
    relation: String,
    contact: String
  }]
}
```

### Medicine Model
```javascript
{
  patientId: ObjectId,
  prescribedBy: ObjectId,
  prescriptionId: ObjectId,
  medicineName: String,
  quantity: Number,
  startDate: Date,
  endDate: Date,
  timing: {
    beforeBreakfast: Boolean,
    afterBreakfast: Boolean,
    beforeLunch: Boolean,
    afterLunch: Boolean,
    beforeDinner: Boolean,
    afterDinner: Boolean
  },
  taken: {
    beforeBreakfast: Boolean,
    afterBreakfast: Boolean,
    beforeLunch: Boolean,
    afterLunch: Boolean,
    beforeDinner: Boolean,
    afterDinner: Boolean
  },
  takenCount: Number,
  missedCount: Number
}
```

### Prescription Model
```javascript
{
  patientId: ObjectId,
  prescribedBy: ObjectId,
  medicines: Array,
  createdAt: Date
}
```

## 🔔 Notification System

### Types of Notifications
1. **Medicine Reminders**: Scheduled based on timing
2. **Missed Dose Alerts**: 1 hour after scheduled time
3. **Expiry Alerts**: When medicine course ends
4. **Low Stock Warnings**: When quantity falls below threshold

### Cron Job Schedule
```javascript
// Daily reset at midnight
'0 0 * * *' - Reset taken status

// Medicine reminders
'30 7 * * *'  - Before breakfast
'30 8 * * *'  - After breakfast
'30 12 * * *' - Before lunch
'30 13 * * *' - After lunch
'30 19 * * *' - Before dinner
'30 20 * * *' - After dinner

// Missed dose check (every 15 minutes)
'*/15 * * * *'

// Expiry check (daily at 9 AM)
'0 9 * * *'
```

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Gradient UI**: Purple-blue color scheme
- **Smooth Animations**: Fade-in, slide-in transitions
- **Loading States**: Spinners and progress bars
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Toast notifications
- **Dropdown Menus**: Profile menu with click-outside detection
- **Active State Highlighting**: Visual feedback for current page
- **Dark Mode Support**: Coming soon

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Token expiry (7 days)
- Protected API routes
- Input validation and sanitization
- XSS protection
- CORS enabled
- Environment variable protection

## 🚦 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Profile creation and updates
- [ ] Prescription creation (manual)
- [ ] OCR prescription upload
- [ ] Medicine tracking (mark taken/missed)
- [ ] Medicine database search
- [ ] Report generation and PDF download
- [ ] Notification triggers
- [ ] Multi-role access

## 🐛 Known Issues

- OCR accuracy depends on image quality
- Handwritten prescriptions may require manual correction
- Notification delivery depends on user being logged in
- Reports require at least one medicine with taken/missed data

## 🚀 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Push notifications (FCM)
- [ ] WhatsApp/SMS reminders
- [ ] Medicine refill reminders
- [ ] Pharmacy integration
- [ ] Doctor appointment booking
- [ ] Health records storage
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Voice commands
- [ ] AI-powered health insights

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- OCR.space for free OCR API
- MongoDB Atlas for database hosting
- Chart.js for beautiful data visualizations
- Tailwind CSS for rapid UI development
- React community for excellent documentation

