<div align="center">

# 🏥 MediFlow
### AI-Powered Remote Patient Monitoring Dashboard

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**Real-time patient vitals monitoring · AI-generated health reports · Live WebSocket alerts · Role-based access control**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [API Docs](#-api-reference) • [Screenshots](#-screenshots)

</div>

---

## 📋 Overview

MediFlow is a full-stack healthcare web application that enables remote patient monitoring in real time. Doctors can track patient vitals, receive critical alerts, generate AI-assisted PDF reports, and manage appointments — all from a single dashboard. Patients can view their health trends, upcoming appointments, and notifications. Admins manage users, analytics, and activity logs.

Built with a **Laravel 12 REST API** backend, a **React 18 + Vite** SPA frontend, **MongoDB Atlas** cloud database, **JWT authentication**, and **Laravel Reverb WebSockets** for live updates.

---

## ✨ Features

### 👨‍⚕️ Doctor
- Live patient vitals dashboard with real-time charts (heart rate, SpO₂, blood pressure, temperature, sugar level)
- Patient list with search, filter, and assignment
- Critical alert notifications via WebSocket
- Appointment scheduling and management
- AI-assisted health report generation with PDF download
- Patient detail view with historical metrics and trends

### 🧑‍💼 Patient
- Personal health metrics dashboard with live charts
- Alert history and severity tracking
- Appointment booking and status tracking
- Downloadable health reports
- In-app notification center

### 🔑 Admin
- Full user management (create, update, deactivate users)
- System-wide analytics and statistics
- Activity log viewer with audit trail
- Dashboard with platform KPIs

### 🔒 Security & Auth
- JWT-based authentication (login, register, refresh tokens)
- Role-based access control (admin / doctor / patient)
- Password reset via email
- Route-level middleware protection

### 📡 Real-time
- WebSocket channels per patient and doctor (Laravel Reverb)
- Live health metric streaming
- Instant critical alert push notifications
- Real-time notification badge updates

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Laravel 12 (PHP 8.2), REST API |
| **Database** | MongoDB Atlas (via `mongodb/laravel-mongodb` v5.7) |
| **Auth** | JWT (`tymon/jwt-auth` v2.3) |
| **WebSockets** | Laravel Reverb v1.10 |
| **PDF Generation** | DomPDF (`barryvdh/laravel-dompdf`) |
| **Frontend** | React 18.3 + Vite 7 (SPA) |
| **State Management** | Redux Toolkit v2.3 |
| **Styling** | Tailwind CSS v4 |
| **Charts** | Recharts v2.13 |
| **HTTP Client** | Axios |
| **WebSocket Client** | Laravel Echo + Pusher JS |

---

## 🏗 Architecture

```
MediFlow/
├── app/
│   ├── Http/
│   │   ├── Controllers/          # REST API controllers
│   │   │   ├── AuthController
│   │   │   ├── PatientController
│   │   │   ├── HealthMetricController
│   │   │   ├── AlertController
│   │   │   ├── ReportController
│   │   │   ├── NotificationController
│   │   │   ├── AppointmentController
│   │   │   └── AdminController
│   │   └── Middleware/
│   │       └── RoleMiddleware     # Role-based access guard
│   ├── Models/                    # MongoDB Eloquent models
│   │   ├── User
│   │   ├── Patient
│   │   ├── HealthMetric
│   │   ├── Alert
│   │   ├── Report
│   │   ├── Notification
│   │   ├── Appointment
│   │   └── ActivityLog
│   ├── Services/                  # Business logic layer
│   │   ├── AuthService
│   │   ├── PatientService
│   │   ├── HealthMetricService
│   │   └── ReportService
│   ├── Repositories/              # Data access layer
│   │   ├── BaseRepository
│   │   ├── UserRepository
│   │   ├── PatientRepository
│   │   └── HealthMetricRepository
│   └── Events/                    # Broadcastable events
│       ├── HealthMetricUpdated
│       └── AlertCreated
│
├── resources/js/                  # React SPA
│   ├── pages/
│   │   ├── auth/                  # Login, Register, ForgotPassword
│   │   ├── admin/                 # AdminDashboard
│   │   ├── doctor/                # DoctorDashboard, PatientDetail
│   │   ├── patient/               # PatientDashboard
│   │   └── shared/                # Alerts, Reports, Appointments, Profile
│   ├── components/
│   │   ├── layout/                # Sidebar, Topbar
│   │   └── ui/                    # MetricCard, LiveChart, AlertBadge
│   ├── redux/
│   │   └── slices/                # auth, alert, patient, metrics, notifications, reports, appointments, ui
│   ├── services/
│   │   ├── api.js                 # Axios instance with JWT interceptor
│   │   └── echo.js                # Laravel Echo + Reverb config
│   └── hooks/
│       └── useRealtimeChannels.js # usePatientChannel, useAlertsChannel
│
├── routes/
│   ├── api.php                    # /api/v1 REST routes
│   ├── channels.php               # WebSocket broadcast channels
│   └── web.php                    # SPA catch-all
│
└── database/
    └── seeders/
        └── DatabaseSeeder.php     # Demo users + health metrics
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| PHP | 8.2+ (Thread Safe, VS16, x64) |
| Composer | 2.x |
| Node.js | 18+ |
| XAMPP / PHP PECL | `ext-mongodb` installed |
| MongoDB Atlas | Free cluster |

### 1. Clone the Repository

```bash
git clone https://github.com/storm309/MediFlow.git
cd MediFlow
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Install Node Dependencies

```bash
npm install
```

### 4. Install MongoDB PHP Extension (XAMPP on Windows)

Download `php_mongodb-x.x.x-8.2-ts-x64.zip` from [GitHub Releases](https://github.com/mongodb/mongo-php-driver/releases), extract `php_mongodb.dll` to `C:\xampp\php\ext\`, and add to `php.ini`:

```ini
extension=mongodb
```

Verify: `php -m | findstr mongodb`

### 5. Configure Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` with your MongoDB Atlas credentials:

```env
DB_CONNECTION=mongodb
DB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/mediflow?appName=Cluster0
DB_DATABASE=mediflow

JWT_SECRET=<run: php artisan jwt:secret>

BROADCAST_CONNECTION=reverb
REVERB_APP_ID=mediflow-app
REVERB_APP_KEY=mediflow-key
REVERB_APP_SECRET=mediflow-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

> **Note:** URL-encode special characters in your MongoDB password — `@` → `%40`, `#` → `%23`

### 6. Generate JWT Secret

```bash
php artisan jwt:secret
```

### 7. Seed Demo Data

```bash
php artisan db:seed
```

Creates three demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mediflow.com | password |
| Doctor | doctor@mediflow.com | password |
| Patient | patient@mediflow.com | password |

### 8. Build Frontend Assets

```bash
npm run build
```

---

## ▶️ Running the Application

Start all three servers in separate terminals:

**Terminal 1 — Laravel API server:**
```bash
php artisan serve
# → http://localhost:8000
```

**Terminal 2 — Reverb WebSocket server:**
```bash
php artisan reverb:start
# → ws://localhost:8080
```

**Terminal 3 — Vite frontend (dev mode):**
```bash
npm run dev
# → http://localhost:5173
```

Open **http://localhost:8000** in your browser.

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1`.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login, returns JWT |
| `POST` | `/auth/logout` | Logout (invalidate token) |
| `POST` | `/auth/refresh` | Refresh JWT token |
| `GET` | `/auth/me` | Get authenticated user profile |
| `POST` | `/auth/forgot-password` | Send password reset email |
| `POST` | `/auth/reset-password` | Reset password with token |

### Patients *(Doctor / Admin)*

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/patients` | List all patients |
| `POST` | `/patients` | Create patient profile |
| `GET` | `/patients/{id}` | Get patient details |
| `PUT` | `/patients/{id}` | Update patient info |
| `DELETE` | `/patients/{id}` | Delete patient |
| `POST` | `/patients/{id}/assign-doctor` | Assign doctor to patient |

### Health Metrics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health-metrics` | List metrics (filterable) |
| `POST` | `/health-metrics` | Submit new reading |
| `GET` | `/health-metrics/recent` | Recent metrics |
| `GET` | `/health-metrics/latest` | Latest metric per patient |
| `GET` | `/health-metrics/averages` | Average values |

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/alerts` | List all alerts |
| `GET` | `/alerts/stats` | Alert statistics |
| `GET` | `/alerts/{id}` | Get single alert |
| `PUT` | `/alerts/{id}/status` | Update alert status |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/reports` | List reports |
| `POST` | `/reports/generate` | Generate new report |
| `GET` | `/reports/{id}` | Get report details |
| `GET` | `/reports/{id}/pdf` | Download PDF |
| `PUT` | `/reports/{id}/notes` | Add notes to report |

### Appointments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/appointments` | List appointments |
| `POST` | `/appointments` | Create appointment |
| `GET` | `/appointments/{id}` | Get appointment |
| `PUT` | `/appointments/{id}` | Update appointment |
| `DELETE` | `/appointments/{id}` | Cancel appointment |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/notifications` | List notifications |
| `PUT` | `/notifications/{id}/read` | Mark as read |
| `PUT` | `/notifications/read-all` | Mark all as read |
| `DELETE` | `/notifications/{id}` | Delete notification |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/dashboard` | Platform statistics |
| `GET` | `/admin/users` | All users |
| `GET` | `/admin/activity-logs` | Audit trail |
| `GET` | `/admin/analytics` | System analytics |

---

## 🔌 WebSocket Channels

| Channel | Event | Description |
|---------|-------|-------------|
| `private-patient.{id}` | `HealthMetricUpdated` | Live vitals for a patient |
| `private-doctor.{id}` | `AlertCreated` | Critical alerts for a doctor |
| `alerts` | `AlertCreated` | Public alert broadcast |

---

## 🗄 Health Metric Model

Each health metric reading contains:

```json
{
  "patient_id": "ObjectId",
  "heart_rate": 75,
  "spo2": 98,
  "blood_pressure": { "systolic": 120, "diastolic": 80 },
  "temperature": 98.6,
  "sugar_level": 95,
  "recorded_at": "2026-05-12T10:00:00Z",
  "source": "device|manual",
  "alerts": []
}
```

### Alert Severity Thresholds

| Metric | Warning | Critical | Emergency |
|--------|---------|----------|-----------|
| Heart Rate | <60 or >100 bpm | <50 or >120 bpm | <40 or >150 bpm |
| SpO₂ | <95% | <90% | <85% |
| Temperature | >99.5°F | >101°F | >104°F |
| Blood Pressure | >140/90 | >160/100 | >180/120 |
| Sugar Level | >180 mg/dL | >250 mg/dL | >400 mg/dL |

---

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage
```

---

## 🚢 Deployment

### Environment Checklist

- [ ] Set `APP_ENV=production` and `APP_DEBUG=false`
- [ ] Generate strong `APP_KEY` and `JWT_SECRET`
- [ ] Configure MongoDB Atlas IP whitelist (or `0.0.0.0/0` for open access)
- [ ] Set `SESSION_DRIVER=file` and `CACHE_STORE=file`
- [ ] Build frontend: `npm run build`
- [ ] Cache config: `php artisan config:cache && php artisan route:cache`
- [ ] Configure a process manager (Supervisor) for Reverb WebSocket server
- [ ] Point web server (Nginx/Apache) to `/public` directory

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ by [storm309](https://github.com/storm309)

**MediFlow** — Empowering healthcare through real-time technology

</div>
