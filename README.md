<div align="center">

# 🏥 MediFlow
### AI-Powered Remote Patient Monitoring Dashboard

[![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**Real-time patient health monitoring · Doctor dashboards · Patient tracking · Admin control panel**

</div>

---

## 📋 What is MediFlow?

MediFlow is a healthcare web application where:
- **Doctors** can monitor patient health, view alerts, and create reports
- **Patients** can check their health metrics and manage appointments  
- **Admins** can manage users and system settings

Built with **Laravel** backend, **React** frontend, and **MongoDB** database.

---

## ✨ Features

### 👨‍⚕️ Doctor Dashboard
- View assigned patients and their health data
- Monitor vital signs (heart rate, blood pressure, temperature, etc.)
- Receive alert notifications
- Schedule and manage appointments
- Generate health reports

### 🧑‍💼 Patient Dashboard
- View your health metrics and trends
- See upcoming appointments
- Upload medical documents
- Request a doctor
- Check notifications

### 🔑 Admin Panel
- Manage all users (doctors and patients)
- Verify new doctors
- Monitor system alerts
- View reports and appointments
- System statistics

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Laravel 12 (PHP 8.2) |
| **Database** | MongoDB |
| **Frontend** | React 18 + Vite |
| **Styling** | Tailwind CSS |
| **Authentication** | JWT |
| **Real-time** | WebSockets |

---

## 🚀 Quick Start

### Requirements
- PHP 8.2+
- Node.js 18+
- MongoDB account (free at mongodb.com)
- Composer

### 1. Clone Repository
```bash
git clone https://github.com/storm309/MediFlow.git
cd MediFlow
```

### 2. Install Dependencies
```bash
composer install
npm install
```

### 3. Setup Environment
```bash
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

Add your MongoDB connection string to `.env`:
```
DB_CONNECTION=mongodb
DB_URL=mongodb+srv://username:password@cluster.mongodb.net/mediflow
```

### 4. Seed Demo Data
```bash
php artisan db:seed
```

Demo Accounts:
- **Admin:** admin@mediflow.local / MediFlow@2024
- **Doctor:** doctor@mediflow.com / password123  
- **Patient:** patient@mediflow.com / password123

### 5. Run the Application

**Terminal 1 — Laravel Server:**
```bash
php artisan serve
# Opens at http://localhost:8000
```

**Terminal 2 — Frontend:**
```bash
npm run dev
# Opens at http://localhost:5173
```

That's it! Open http://localhost:8000 in your browser.

---

## 📁 Project Structure

```
MediFlow/
├── app/                    # Laravel backend
│   ├── Controllers/        # API endpoints
│   ├── Models/            # Database models
│   └── Services/          # Business logic
├── resources/js/          # React frontend
│   ├── pages/            # Dashboard pages
│   ├── components/       # UI components
│   └── redux/            # State management
├── routes/               # API routes
├── database/             # Migrations & seeders
└── public/               # Static files
```

---

## 🔐 User Roles

### Admin
- Create and delete users
- Verify doctors
- Monitor system

### Doctor  
- View patient health data
- Send alerts
- Create reports
- Manage appointments

### Patient
- View own health data
- Upload documents
- Book appointments
- Request doctors

---

## 📡 Main Features

✅ User authentication with login/register  
✅ Role-based access (admin, doctor, patient)  
✅ Health metrics dashboard  
✅ Alert system  
✅ Document upload  
✅ Appointment management  
✅ Doctor verification system  
✅ Real-time notifications  
✅ Responsive design (works on mobile & desktop)  

---

## 🧪 Testing

All main features have been tested:
- ✅ Admin panel - users, doctors, alerts, reports
- ✅ Patient dashboard - health data, doctor request, documents
- ✅ Security - login, authentication, role protection
- ✅ API endpoints - all working

See [TESTING_REPORT.md](TESTING_REPORT.md) for detailed test results.

---

## 📚 API Endpoints

All endpoints start with `/api/v1`

### Authentication
- `POST /auth/login` - Login
- `POST /auth/register` - Create account
- `POST /auth/logout` - Logout

### Health Data
- `GET /health-metrics` - Get your metrics
- `POST /health-metrics` - Add new metric
- `GET /alerts` - Get alerts

### Appointments
- `GET /appointments` - List appointments
- `POST /appointments` - Book appointment
- `PUT /appointments/{id}` - Update appointment

### Users (Admin only)
- `GET /admin/users` - List all users
- `POST /admin/doctors/create` - Create doctor
- `PUT /admin/users/{id}/role` - Change user role

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📝 License

MIT License - feel free to use for learning or projects

---

<div align="center">

**MediFlow** - Healthcare made simple 🏥

Questions? Check [TESTING_REPORT.md](TESTING_REPORT.md) or [PROJECT_REPORT.md](PROJECT_REPORT.md)

</div>
