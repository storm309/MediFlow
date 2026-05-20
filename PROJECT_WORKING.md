# MediFlow — Complete Project Documentation

> **Stack:** Laravel 12 (PHP 8.2) · React 18 · MongoDB · Pusher · Google Gemini AI  
> **Type:** Full-stack Medical Health Monitoring SaaS  
> **Repo:** https://github.com/storm309/MediFlow

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [How It Works — System Flow](#4-how-it-works--system-flow)
5. [User Roles](#5-user-roles)
6. [Authentication System](#6-authentication-system)
7. [Health Metrics System](#7-health-metrics-system)
8. [Alerts System](#8-alerts-system)
9. [AI Features (Google Gemini)](#9-ai-features-google-gemini)
10. [Reports System](#10-reports-system)
11. [Appointments System](#11-appointments-system)
12. [Notifications & Real-Time](#12-notifications--real-time)
13. [File Upload System](#13-file-upload-system)
14. [API Reference](#14-api-reference)
15. [Frontend Architecture](#15-frontend-architecture)
16. [Database Schema](#16-database-schema)
17. [Environment Variables](#17-environment-variables)
18. [Running the Project](#18-running-the-project)

---

## 1. Project Overview

MediFlow is a **real-time medical health monitoring platform** that connects patients, doctors, and admins on a single dashboard. It tracks live vitals, auto-generates health alerts, runs AI-powered risk analysis using Google Gemini, and produces downloadable PDF health reports.

**Core Capabilities:**
- Live health metric tracking (heart rate, SpO₂, blood pressure, temperature, sugar, ECG)
- Automatic alert generation when vitals cross critical thresholds
- AI risk scoring and chat assistant powered by Google Gemini 2.5 Flash
- PDF health report generation
- Doctor–patient assignment and appointment management
- Role-based access control (Admin / Doctor / Patient)
- Real-time updates via Pusher WebSockets
- PWA-ready (service worker registered)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | Laravel 12 (PHP 8.2) |
| Frontend Framework | React 18.3 with Vite 7 |
| Database | MongoDB (via `mongodb/laravel-mongodb`) |
| Authentication | JWT tokens (`tymon/jwt-auth`) |
| Real-Time | Pusher Channels + Laravel Echo |
| AI Engine | Google Gemini 2.5 Flash API |
| PDF Generation | DomPDF (`barryvdh/laravel-dompdf`) |
| Styling | Tailwind CSS v4 |
| State Management | Redux Toolkit |
| Charts | Recharts |
| HTTP Client | Axios |
| Notifications | `react-hot-toast` |

---

## 3. Project Structure

```
MediFlow/
├── app/
│   ├── Console/Commands/       # Artisan commands (e.g. mongo:indexes)
│   ├── Events/                 # Broadcast events (AlertCreated, HealthMetricUpdated)
│   ├── Http/
│   │   ├── Controllers/        # API controllers
│   │   └── Middleware/         # JWT auth, Role check
│   ├── Listeners/              # Event listeners (SendAlertNotification)
│   ├── Models/                 # Eloquent MongoDB models
│   ├── Providers/              # AppServiceProvider, EventServiceProvider
│   ├── Repositories/           # Data access layer (BaseRepository pattern)
│   └── Services/               # Business logic layer
├── config/                     # Laravel config files
├── database/migrations/        # DB migrations (indexes, schema)
├── public/build/               # Compiled Vite assets
├── resources/
│   ├── css/                    # Tailwind CSS
│   ├── js/
│   │   ├── components/         # Reusable React components
│   │   │   ├── layout/         # Sidebar, Topbar
│   │   │   ├── modals/         # RequestDoctorModal etc.
│   │   │   └── ui/             # MetricCard, LiveChart, AiRiskCard, etc.
│   │   ├── hooks/              # Custom React hooks (real-time channels)
│   │   ├── layouts/            # AuthLayout, DashboardLayout
│   │   ├── pages/
│   │   │   ├── admin/          # AdminDashboard, UsersManagement, DoctorVerification
│   │   │   ├── auth/           # Login, Register, ForgotPassword
│   │   │   ├── doctor/         # DoctorDashboard, PatientDetail
│   │   │   ├── patient/        # PatientDashboard
│   │   │   └── shared/         # Reports, Appointments, Alerts, Notifications, Profile
│   │   ├── redux/              # Redux store + slices
│   │   └── services/           # Axios API client, Echo websocket
│   └── views/                  # Laravel Blade (single index.blade.php entry)
└── routes/
    ├── api.php                 # All REST API routes
    └── channels.php            # Broadcast channel authorization
```

---

## 4. How It Works — System Flow

### Overall Request Flow

```
Browser (React SPA)
       │
       │  HTTP + JWT Token
       ▼
Laravel API (routes/api.php)
       │
       ├── Middleware: jwt.auth  → validates token
       ├── Middleware: role:X    → checks user role
       │
       ▼
Controller → Service → Repository → MongoDB
                 │
                 ├── Broadcasts events → Pusher → React (via Laravel Echo)
                 └── Calls GeminiService → Google Gemini API
```

### Registration & Login Flow

```
1. User registers (POST /api/v1/auth/register)
2. AuthService creates User record in MongoDB
3. If role = patient → creates Patient profile record
4. JWT token generated and returned
5. React stores token in localStorage
6. All subsequent requests send: Authorization: Bearer <token>
```

### Patient Vitals Flow

```
1. Doctor/Simulation POSTs health metrics (POST /api/v1/patients/{id}/metrics)
2. HealthMetricService:
   a. Saves metric to MongoDB health_metrics collection
   b. Broadcasts HealthMetricUpdated event → Pusher → live chart updates
   c. Runs detectAlerts() on the metric
   d. If critical thresholds crossed → creates Alert in MongoDB
   e. Broadcasts AlertCreated event → Pusher → toast notification
   f. Updates Patient.is_critical flag
3. Doctor's LiveChart component updates in real time
```

### AI Risk Analysis Flow

```
1. Frontend calls POST /api/v1/ai/risk/{patientId}
2. AiController fetches latest vitals + history for patient
3. GeminiService builds a clinical prompt and calls Gemini 2.5 Flash API
4. Gemini returns JSON: { risk_score, risks[], summary, recommendations[], severity }
5. Result cached in Laravel Cache for 15 minutes (avoids repeated API costs)
6. Saved to ai_analyses collection for history tracking
7. AiRiskCard component displays the risk gauge
```

---

## 5. User Roles

| Role | What They Can Do |
|---|---|
| **admin** | Manage all users, verify doctors, view system analytics, assign doctors to patients |
| **doctor** | View assigned patients, track vitals, manage alerts, write report notes, manage appointments |
| **patient** | View own vitals, generate health reports, upload files, book appointments, chat with AI |

### Role-Based UI

- **Admin Dashboard:** User management, doctor verification, system analytics
- **Doctor Dashboard:** Patient list, live vitals monitor, alerts queue, appointments
- **Patient Dashboard:** Own vitals charts, AI risk card, file uploads, appointment booking

Route-level protection in React (`PrivateRoute` component checks `user.role`) and backend-level protection via `role:admin,doctor` middleware on each route.

---

## 6. Authentication System

**Backend:** `tymon/jwt-auth` package  
**File:** `app/Services/AuthService.php`, `app/Http/Controllers/AuthController.php`

### Endpoints

| Method | URL | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login, returns JWT token |
| POST | `/api/v1/auth/logout` | Invalidate token |
| POST | `/api/v1/auth/refresh` | Refresh JWT token |
| GET  | `/api/v1/auth/me` | Get current user data |
| PUT  | `/api/v1/auth/profile` | Update profile |
| PUT  | `/api/v1/auth/password` | Change password |
| POST | `/api/v1/auth/forgot-password` | Send reset email |
| POST | `/api/v1/auth/reset-password` | Reset with token |

### JWT Storage (Frontend)
- Token stored in `localStorage` as `mediflow_token`
- Attached to every request via Axios request interceptor
- On 401 response → auto redirect to `/login`
- On page load → if token exists, `fetchMe()` is dispatched to rehydrate Redux state

---

## 7. Health Metrics System

**Files:** `app/Models/HealthMetric.php`, `app/Services/HealthMetricService.php`, `app/Repositories/HealthMetricRepository.php`

### Tracked Vital Signs

| Field | Unit | Critical Threshold |
|---|---|---|
| `heart_rate` | bpm | > 110 = critical |
| `spo2` | % | < 90 = emergency |
| `temperature` | °F | > 103 = fever alert |
| `blood_pressure_systolic` | mmHg | > 140 = hypertension |
| `blood_pressure_diastolic` | mmHg | > 90 = hypertension |
| `sugar_level` | mg/dL | > 200 = diabetes alert |
| `respiratory_rate` | breaths/min | — |
| `weight` | kg | — |
| `ecg_data` | array | — |

### API Endpoints

| Method | URL | Role | Description |
|---|---|---|---|
| GET | `/patients/{id}/metrics` | All | Paginated history |
| POST | `/patients/{id}/metrics` | Admin, Doctor | Record new reading |
| GET | `/patients/{id}/metrics/recent` | All | Last 50 for live chart |
| GET | `/patients/{id}/metrics/latest` | All | Most recent single reading |
| GET | `/patients/{id}/metrics/averages` | All | Averages for a period |

### How Averages Work
Averages are calculated using **MongoDB aggregation pipeline** (`$group` with `$avg`) — no data is loaded to PHP. Supports `daily`, `weekly`, `monthly` periods.

---

## 8. Alerts System

**Files:** `app/Models/Alert.php`, `app/Http/Controllers/AlertController.php`

Alerts are **automatically created** when health metrics cross thresholds. They are **not** manually created.

### Alert Types & Thresholds

| Condition | Severity |
|---|---|
| Heart rate > 110 | critical |
| SpO₂ < 90 | emergency |
| Temperature > 103°F | fever (warning) |
| Sugar > 200 | diabetes (warning) |
| BP Systolic > 140 | hypertension (warning) |

### Alert Statuses
`unread` → `read` → `resolved` or `dismissed`

### API Endpoints (Doctors & Admins)

| Method | URL | Description |
|---|---|---|
| GET | `/api/v1/alerts` | List alerts (filtered by doctor's patients) |
| GET | `/api/v1/alerts/stats` | Count by status/severity (single aggregation) |
| GET | `/api/v1/alerts/{id}` | Alert detail |
| PATCH | `/api/v1/alerts/{id}/status` | Update status + add notes |

---

## 9. AI Features (Google Gemini)

**Files:** `app/Services/GeminiService.php`, `app/Http/Controllers/AiController.php`  
**Model Used:** `gemini-2.5-flash`

### Three AI Capabilities

#### 1. Risk Analysis
- Endpoint: `POST /api/v1/ai/risk/{patientId}`
- Builds clinical prompt with latest vitals + history + patient age/conditions
- Returns: `risk_score` (0–100), `risks[]`, `summary`, `recommendations[]`, `severity`
- **Cached for 15 minutes** per patient (avoids redundant API calls)
- Saved to `ai_analyses` collection for history

#### 2. Report Summary
- Endpoint: `POST /api/v1/ai/report-summary/{patientId}` (Doctor/Admin only)
- Generates an AI-written clinical summary of a patient's health report
- Calls Gemini with full report data and returns narrative text

#### 3. AI Chat Assistant
- Endpoint: `POST /api/v1/ai/chat`
- Multi-turn conversation with patient/doctor context injected
- Chat history stored in `chat_histories` collection
- History: `GET /api/v1/ai/chat/history`
- Clear: `DELETE /api/v1/ai/chat/history`

---

## 10. Reports System

**Files:** `app/Services/ReportService.php`, `app/Http/Controllers/ReportController.php`

### Report Generation Process
1. Patient or Doctor triggers `POST /api/v1/reports/generate`
2. ReportService fetches patient data + vitals averages for the requested period
3. Creates a `Report` document in MongoDB with:
   - Vital averages (heart rate avg, SpO₂ avg, etc.)
   - Patient info
   - Period dates
   - Status: `draft`
4. Doctor can add clinical notes via `PATCH /api/v1/reports/{id}/notes`
5. Status progresses: `draft` → `reviewed` → `finalized`
6. PDF generated on demand via `GET /api/v1/reports/{id}/pdf` (using DomPDF)
7. PDF path cached in `report.pdf_path` — regenerated only if missing

### API Endpoints

| Method | URL | Role | Description |
|---|---|---|---|
| GET | `/api/v1/reports` | All | List reports |
| POST | `/api/v1/reports/generate` | Doctor, Admin | Generate report |
| GET | `/api/v1/reports/{id}` | All | Report detail |
| GET | `/api/v1/reports/{id}/pdf` | All | Download PDF |
| PATCH | `/api/v1/reports/{id}/notes` | Doctor, Admin | Add notes |

---

## 11. Appointments System

**Files:** `app/Models/Appointment.php`, `app/Http/Controllers/AppointmentController.php`

### Appointment Types
`consultation` | `follow_up` | `emergency` | `routine`

### Appointment Statuses
`scheduled` → `confirmed` → `completed` or `cancelled` or `no_show`

### Authorization Rules
- **Doctors** can only modify/delete their own appointments
- **Patients** can only update their own appointments
- **Admins** can manage any appointment
- When created → notifications sent to both patient and doctor

### API Endpoints

| Method | URL | Role | Description |
|---|---|---|---|
| GET | `/api/v1/appointments` | All | List (filtered by role) |
| POST | `/api/v1/appointments` | Doctor, Admin | Create appointment |
| PATCH | `/api/v1/appointments/{id}` | All (with auth) | Update |
| DELETE | `/api/v1/appointments/{id}` | Doctor, Admin | Delete |

---

## 12. Notifications & Real-Time

### Pusher WebSockets
**File:** `resources/js/hooks/useRealtimeChannels.js`, `resources/js/services/echo.js`

Two active channels:

| Channel | Who Subscribes | Events |
|---|---|---|
| `private-patient.{patientId}` | Patient + their Doctor | `.metric.updated`, `.alert.created` |
| `alerts` (public) | All logged-in users | `.alert.created` |

### How Real-Time Works
1. Doctor/device POSTs new vitals
2. Backend fires `HealthMetricUpdated` event → Pusher
3. Patient channel receives `.metric.updated` → Redux `addLiveMetric` → LiveChart updates instantly
4. If alert triggered → `AlertCreated` event → Pusher → toast notification appears

### Notifications (In-App)
- Stored in `notifications` collection in MongoDB
- Created for: appointments scheduled, doctor assigned, doctor verified, password changed
- Displayed via bell icon in Topbar with unread count badge
- API: `GET /api/v1/notifications`, `PATCH /{id}/read`, `POST /mark-all-read`

---

## 13. File Upload System

**Files:** `app/Http/Controllers/FileUploadController.php`, `app/Models/UploadedFile.php`

### Allowed File Types
PDF, JPEG, PNG, WEBP, GIF — max **10 MB**

### Upload Types
`report` | `prescription` | `scan` | `xray` | `other`

### Security
- Files stored at `storage/app/uploads/{type}/{uuid}.ext` — never publicly accessible by URL
- Original filenames never stored or exposed as paths (UUID-renamed)
- Served via authenticated API endpoint `GET /api/v1/uploads/serve/{id}`
- Patients can only access their own files
- MIME type validated server-side (not just extension)

---

## 14. API Reference

All routes are prefixed `/api/v1`. All protected routes require:
```
Authorization: Bearer <jwt_token>
```

### Base URL Groups

| Prefix | Controller | Auth Required |
|---|---|---|
| `/auth/*` | AuthController | Partial |
| `/admin/*` | AdminController | Admin only |
| `/patients/*` | PatientController | Varies |
| `/alerts/*` | AlertController | All roles |
| `/reports/*` | ReportController | All roles |
| `/appointments/*` | AppointmentController | All roles |
| `/notifications/*` | NotificationController | All roles |
| `/uploads/*` | FileUploadController | All roles |
| `/ai/*` | AiController | All roles |

### Response Format
All responses follow this structure:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Errors:
```json
{
  "success": false,
  "message": "Error description",
  "errors": { "field": ["Validation error"] }
}
```

---

## 15. Frontend Architecture

### Tech
- **React 18** with functional components and hooks
- **Redux Toolkit** for global state management
- **React Router v6** for client-side routing
- **Axios** for HTTP requests with interceptors
- **Tailwind CSS v4** for styling
- **Recharts** for live health metric charts

### Redux Store Slices

| Slice | State Managed |
|---|---|
| `authSlice` | user, token, loading, initialized |
| `alertSlice` | alerts list, stats, live alerts queue |
| `metricsSlice` | history, recent (chart data), latestByPatient |
| `reportSlice` | reports list |
| `appointmentSlice` | appointments list |
| `notificationSlice` | notifications, unread count |
| `uiSlice` | darkMode, sidebarOpen |

### Page → Role Mapping

| URL | Component | Allowed Roles |
|---|---|---|
| `/admin` | AdminDashboard | admin |
| `/admin/users` | AdminUsersManagement | admin |
| `/admin/doctors/verify` | DoctorVerificationPage | admin |
| `/doctor` | DoctorDashboard | doctor |
| `/doctor/patients/:id` | PatientDetail | doctor, admin |
| `/patient` | PatientDashboard | patient |
| `/alerts` | AlertsPage | doctor |
| `/reports` | ReportsPage | doctor, patient |
| `/appointments` | AppointmentsPage | doctor, patient |
| `/notifications` | NotificationsPage | all |
| `/profile` | ProfilePage | all |

### Code Splitting (Vite Chunks)
Production build is split into separate cached bundles:
- `vendor-react` — React + React DOM + React Router
- `vendor-redux` — Redux Toolkit + react-redux
- `vendor-charts` — Recharts + date-fns
- `vendor-realtime` — Pusher JS + Laravel Echo
- `main` — App-specific code

---

## 16. Database Schema

Database: **MongoDB** (NoSQL). No fixed schema — uses Eloquent MongoDB models.

### Collections

#### `users`
```
_id, name, email, password, role (admin|doctor|patient),
phone, avatar, is_active, is_verified, verification_status,
medical_license, specialization, qualifications,
verified_at, verified_by, verification_notes, created_at, updated_at
```

#### `patients`
```
_id, user_id, doctor_id, date_of_birth, gender, blood_type,
medical_conditions[], allergies[], is_critical,
last_checkup, emergency_contact, created_at, updated_at
```

#### `health_metrics`
```
_id, patient_id, heart_rate, spo2, blood_pressure_systolic,
blood_pressure_diastolic, temperature, sugar_level, ecg_data[],
respiratory_rate, weight, timestamp, source (manual|device|simulation)
```
**Indexes:** `{patient_id, timestamp}`, `{patient_id}`, `{timestamp}`

#### `alerts`
```
_id, patient_id, doctor_id, metric_id, type, message,
severity (emergency|critical|warning|info),
status (unread|read|resolved|dismissed),
resolved_at, resolved_by, notes, created_at
```
**Indexes:** `{patient_id, status}`, `{status}`, `{severity}`, `{created_at}`

#### `reports`
```
_id, patient_id, doctor_id, period (daily|weekly|monthly),
start_date, end_date, avg_heart_rate, avg_spo2, avg_temperature,
avg_blood_pressure_systolic, avg_blood_pressure_diastolic, avg_sugar_level,
doctor_notes, status (draft|reviewed|finalized), pdf_path, created_at
```

#### `appointments`
```
_id, patient_id, doctor_id, title, description, scheduled_at,
duration, type, location, meeting_link,
status (scheduled|confirmed|cancelled|completed|no_show),
notes, cancelled_reason, cancelled_at, completed_at, created_at
```

#### `notifications`
```
_id, user_id, type, title, message, is_read, data{}, created_at
```

#### `uploaded_files`
```
_id, user_id, patient_id, type, label, filename, path, mime_type, size_bytes, created_at
```

#### `ai_analyses`
```
_id, patient_id, risk_score, severity, risks[], summary, recommendations[], created_at
```

#### `chat_histories`
```
_id, user_id, patient_id, role, content, created_at
```

#### `activity_logs`
```
_id, user_id, action, entity_type, entity_id, metadata{}, created_at
```

---

## 17. Environment Variables

Key variables required in `.env`:

```env
# App
APP_NAME=MediFlow
APP_ENV=production
APP_KEY=base64:...
APP_URL=http://localhost

# Database (MongoDB)
DB_CONNECTION=mongodb
DB_HOST=127.0.0.1
DB_PORT=27017
DB_DATABASE=mediflow
DB_USERNAME=
DB_PASSWORD=

# JWT
JWT_SECRET=your_jwt_secret

# Pusher (Real-time)
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=mt1
VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Mail (for password reset)
MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=noreply@mediflow.com
```

---

## 18. Running the Project

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MongoDB (local or Atlas)
- XAMPP / Laravel Herd

### Setup Steps

```bash
# 1. Install PHP dependencies
composer install

# 2. Install Node dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Generate app key
php artisan key:generate

# 5. Generate JWT secret
php artisan jwt:secret

# 6. Create MongoDB indexes (run once)
php artisan mongo:indexes

# 7. Seed database (optional)
php artisan db:seed

# 8. Build frontend (production)
npm run build

# OR for development with hot reload:
npm run dev
```

### Development Commands

```bash
# Start Laravel server
php artisan serve

# Start Vite dev server (frontend hot reload)
npm run dev

# Clear all caches
php artisan optimize:clear

# Create MongoDB indexes
php artisan mongo:indexes

# Run tests
php artisan test
```

---

*Last updated: May 20, 2026*
