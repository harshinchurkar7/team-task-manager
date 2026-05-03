# Team Task Manager

A full-stack Team Task Manager web application with role-based access control.

## 🚀 Live Demo
- **Frontend:** https://team-task-manager-frontend-gvay.onrender.com
- **Backend API:** https://team-task-manager-backend-acfd.onrender.com
- **GitHub Repo:** https://github.com/harshinchurkar7/team-task-manager

## 🔑 Default Login
- **Admin:** admin@test.com / admin123
- **Member:** signup as new user and select role Member

## 🛠 Tech Stack
- **Backend:** Spring Boot (Java), Maven
- **Database:** PostgreSQL
- **Frontend:** React (Vite), Axios, TailwindCSS
- **Auth:** JWT
- **Deployed on:** Render

## ✨ Features
- JWT Authentication (Signup/Login with role selection)
- Role-based access control (Admin/Member)
- Admin Dashboard: universal stats, all tasks, all projects
- Member Dashboard: personal stats, assigned tasks only
- Project management with member assignment (Free/Busy status)
- Task creation, assignment and status tracking
- Overdue task highlighting in red
- Toast notifications for all actions
- User-friendly error messages
- Protected routes by role

## 📁 Project Structure
- /backend → Spring Boot REST API (port 8080)
- /frontend → React web app (port 3000)

## 🏃 Run Locally

### Prerequisites
- Java 17+
- Maven
- Node.js 18+
- PostgreSQL

### Database Setup
CREATE DATABASE taskmanager;

### Backend
cd backend
mvn spring-boot:run

### Frontend
cd frontend
npm install
npm run dev

## 🔑 Default Admin Account
- Email: admin@test.com
- Password: admin123

## 🔗 API Endpoints

### Auth
- POST /api/auth/signup
- POST /api/auth/login

### Projects (JWT Protected)
- POST /api/projects (ADMIN only)
- GET /api/projects
- POST /api/projects/{id}/members (ADMIN only)
- DELETE /api/projects/{id}/members/{userId} (ADMIN only)
- DELETE /api/projects/{id} (ADMIN only)

### Tasks (JWT Protected)
- POST /api/tasks (ADMIN only)
- GET /api/tasks/project/{projectId}
- PUT /api/tasks/{id}
- PUT /api/tasks/{id}/unassign (ADMIN only)
- DELETE /api/tasks/{id} (ADMIN only)
- GET /api/tasks/overdue
- GET /api/tasks/assigned/me

### Dashboard
- GET /api/dashboard
- GET /api/dashboard/admin
- GET /api/dashboard/member

## 🔐 Role-Based Access
- ADMIN: create/delete projects, create/delete/assign tasks, manage members
- MEMBER: view enrolled projects, view and update status of assigned tasks only
