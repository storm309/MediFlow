# MediFlow — Project Report

## 1. Project Overview

**MediFlow** is a full-stack, real-time healthcare monitoring platform designed to connect patients, doctors, and administrators in a single unified web application. It enables live tracking of patient health vitals, automated alert generation, appointment management, health report generation, and role-based access control — all through a modern, responsive interface.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Laravel 12 (PHP 8.2) |
| **Database** | MongoDB Atlas (Cloud) via `mongodb-laravel` |
| **Authentication** | JWT (tymon/jwt-auth v2.3) |
| **Real-time** | Laravel Reverb (WebSocket, port 8080) |
| **Frontend** | React 18.3 + Vite 7 (SPA) |
| **State Management** | Redux Toolkit v2.3 |
| **Styling** | Tailwind CSS v4 |
| **Charts** | Recharts v2.13 |
| **Notifications** | react-hot-toast |
| **API Prefix** | `/api/v1` |

---

## 3. User Roles

MediFlow supports three distinct user roles, each with a dedicated dashboard and permission set:

### 🔒 Admin
- Full system access
- Manage all users (doctors & patients)
- View platform-wide analytics and KPIs
- Audit activity logs
- Delete users and manage the platform

### 🩺 Doctor
- Monitor all assigned patients
- View live health vitals with real-time charts
- Receive critical/emergency alerts instantly
- Generate and download PDF health reports
- Manage patient appointments
- View patient detail pages with full metric history

### 🏥 Patient
- View personal health dashboard with latest vitals
- Track health trends over time (live charts)
- View and download personal health reports
- Track upcoming appointments
- Manage personal profile and password
- Receive in-app notifications

---

## 4. Core Features & Modules

### 4.1 Authentication
- **Register** — name, email, password (min 8 chars), role selection (doctor/patient)
- **Login** — email + password, returns JWT Bearer token
- **Logout** — token invalidation
- **Forgot Password** — sends reset link via email
- **Reset Password** — token-based secure reset
- **Profile Update** — update name & phone number
- **Password Change** — verify current password, set new password

### 4.2 Health Metrics
The central module of MediFlow. Records and tracks the following vitals per patient:

| Metric | Unit | Alert Thresholds |
|---|---|---|
| Heart Rate | bpm | > 110 = critical |
| SpO2 (Blood Oxygen) | % | < 90 = emergency |
| Blood Pressure (Systolic) | mmHg | > 160 = critical |
| Blood Pressure (Diastolic) | mmHg | > 100 = warning |
| Body Temperature | °F | > 103 = fever alert |
| Blood Sugar | mg/dL | > 250 = diabetes alert |
| Respiratory Rate | breaths/min | tracked |
| Weight | kg/lbs | tracked |
| ECG Data | array | tracked |

**Data sources:** manual entry, device, or simulation.

**API Endpoints:**
- `GET /patients/{id}/metrics` — paginated history
- `GET /patients/{id}/metrics/recent` — last N readings for charts
- `GET /patients/{id}/metrics/latest` — single latest reading
- `GET /patients/{id}/metrics/averages` — weekly/monthly averages
- `POST /patients/{id}/metrics` — record new reading

### 4.3 Real-time Alerts
- Automatically generated when a new health metric is recorded and thresholds are breached
- **Severity levels:** `emergency`, `critical`, `warning`, `info`
- **Alert types:** critical heart rate, low SpO2, high blood pressure, fever, high blood sugar
- Doctors receive live WebSocket push notifications on new critical alerts
- Alerts can be marked as read, resolved (with notes), or dismissed

### 4.4 Real-time WebSocket (Laravel Reverb)
- WebSocket server runs on port 8080
- Patients are subscribed to private channels: `patient.{id}`
- When a new health metric is recorded, an event is broadcast to the patient channel
- Doctor dashboard and patient dashboard both listen live and update charts without page refresh

### 4.5 Appointments
- Doctors or admins can create appointments for patients
- Fields: patient, doctor, date/time, type, location, status (scheduled/completed/cancelled)
- Both doctors and patients can view their appointments
- Patients can cancel; doctors/admins can update status

### 4.6 Reports
- Doctors/admins can generate health summary reports for any patient
- Reports include: vital averages, alert summary, trend analysis
- PDF download support
- Doctors can add clinical notes to existing reports

### 4.7 Notifications
- In-app notification system for all roles
- Notifications for: new alerts, appointment updates, report generation
- Mark single or all notifications as read
- Deletable notifications

### 4.8 Admin Panel
- Dashboard with KPIs: Total Users, Total Doctors, Total Patients, Active Alerts
- Full user management (view, edit, delete any user)
- Activity audit log (tracks login, registration, metric entries)
- Platform analytics

---

## 5. Database Models (MongoDB Collections)

| Model | Collection | Purpose |
|---|---|---|
| `User` | `users` | All users (admin, doctor, patient) with role |
| `Patient` | `patients` | Extended patient profile linked to user |
| `HealthMetric` | `health_metrics` | All vital readings per patient |
| `Alert` | `alerts` | Auto-generated health alerts |
| `Appointment` | `appointments` | Doctor-patient appointment records |
| `Report` | `reports` | Generated health summary reports |
| `Notification` | `notifications` | In-app notifications per user |
| `ActivityLog` | `activity_logs` | Audit trail for all actions |

---

## 6. API Routes Summary

### Public
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login, returns JWT |
| POST | `/api/v1/auth/forgot-password` | Send reset email |
| POST | `/api/v1/auth/reset-password` | Reset with token |

### Protected (JWT required)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/auth/me` | Get logged-in user |
| POST | `/api/v1/auth/logout` | Logout |
| PUT | `/api/v1/auth/profile` | Update name/phone |
| PUT | `/api/v1/auth/password` | Change password |
| GET | `/api/v1/patients` | List patients (admin/doctor) |
| GET | `/api/v1/patients/{id}` | Patient detail |
| POST | `/api/v1/patients` | Create patient record |
| PUT | `/api/v1/patients/{id}` | Update patient |
| GET | `/api/v1/patients/{id}/metrics` | Metric history |
| POST | `/api/v1/patients/{id}/metrics` | Record new metric |
| GET | `/api/v1/patients/{id}/metrics/latest` | Latest reading |
| GET | `/api/v1/alerts` | List alerts |
| PATCH | `/api/v1/alerts/{id}/status` | Update alert status |
| GET | `/api/v1/appointments` | List appointments |
| POST | `/api/v1/appointments` | Create appointment |
| PATCH | `/api/v1/appointments/{id}` | Update appointment |
| GET | `/api/v1/reports` | List reports |
| POST | `/api/v1/reports/generate` | Generate report |
| GET | `/api/v1/reports/{id}/pdf` | Download PDF |
| GET | `/api/v1/notifications` | List notifications |
| PATCH | `/api/v1/notifications/{id}/read` | Mark read |
| GET | `/api/v1/admin/dashboard` | Admin KPIs (admin only) |
| GET | `/api/v1/admin/users` | All users (admin only) |
| GET | `/api/v1/admin/analytics` | Platform analytics (admin only) |

---

## 7. Frontend Pages

| Page | Route | Access |
|---|---|---|
| Landing Page | `/` | Public |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Forgot Password | `/forgot-password` | Public |
| Admin Dashboard | `/dashboard` | Admin |
| Doctor Dashboard | `/dashboard` | Doctor |
| Patient Dashboard | `/dashboard` | Patient |
| Patient Detail | `/patients/:id` | Doctor/Admin |
| Alerts | `/alerts` | All roles |
| Appointments | `/appointments` | All roles |
| Reports | `/reports` | All roles |
| Profile | `/profile` | All roles |

---

## 8. Security Features

- **JWT Authentication** — stateless, token-based auth with refresh support
- **Role-based Middleware** — `role:admin`, `role:admin,doctor` guards on sensitive routes
- **Password Hashing** — bcrypt via Laravel's Hash facade
- **Input Validation** — all endpoints validated server-side with Laravel Validator
- **Private WebSocket Channels** — patients only receive their own live data
- **MongoDB Atlas** — cloud database with IP allowlist and TLS encryption

---

## 9. Project Structure

```
MediFlow/
├── app/
│   ├── Http/Controllers/     # AuthController, PatientController, AlertController, etc.
│   ├── Models/               # User, Patient, HealthMetric, Alert, Report, etc.
│   ├── Services/             # Business logic layer
│   ├── Providers/            # AppServiceProvider
├── routes/
│   ├── api.php               # All API routes (/api/v1)
│   └── web.php               # SPA catch-all
├── resources/
│   └── js/
│       ├── pages/            # React pages (auth/, admin/, doctor/, patient/, shared/)
│       ├── components/       # Reusable UI (Sidebar, Topbar, MetricCard, LiveChart, etc.)
│       ├── redux/            # Store + slices (auth, metrics, alerts, etc.)
│       ├── services/         # Axios API client
│       └── main.jsx          # React entry point
├── config/
│   └── database.php          # MongoDB connection config
└── .env                      # Environment variables (DB, JWT, Reverb)
```

---

## 10. How to Run

**Backend (Laravel):**
```
cd C:\Users\Asus\MediFlow
C:\xampp\php\php.exe artisan serve
```
Runs on: http://localhost:8000

**Frontend (React + Vite):**
```
cd C:\Users\Asus\MediFlow
npm run dev
```
Runs on: http://localhost:5173

**WebSocket (Reverb):**
```
C:\xampp\php\php.exe artisan reverb:start
```
Runs on: ws://localhost:8080

---

## 11. Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@mediflow.com | password |
| Doctor | doctor@mediflow.com | password |
| Patient | patient@mediflow.com | password |

---

*MediFlow — Real-time patient monitoring for modern healthcare.*
