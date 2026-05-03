# Team Task Manager

Full-stack Team Task Manager built with:
- Backend: Spring Boot (Java 17, Maven)
- Database: PostgreSQL
- Frontend: React (Vite), Axios, TailwindCSS
- Authentication: JWT

## Project Structure

- `backend` - Spring Boot REST API
- `frontend` - React web app

## Prerequisites

- Java 17
- Maven
- Node.js 20+
- PostgreSQL 14+

## Database Setup

Create database and ensure credentials:
- DB name: `taskmanager`
- Username: `postgres`
- Password: `postgres`
- Port: `5432`

Example SQL:

```sql
CREATE DATABASE taskmanager;
```

## Backend Setup (`/backend`)

1. Install dependencies and run:
   - `mvn spring-boot:run`
2. Backend runs on:
   - `http://localhost:8080`
3. Config is pre-set in:
   - `backend/src/main/resources/application.properties`

### Default Admin Seeder

On startup, a default admin is created (if not existing):
- Email: `admin@test.com`
- Password: `admin123`

## Frontend Setup (`/frontend`)

1. Install dependencies:
   - `npm install`
2. Run dev server:
   - `npm run dev`
3. Frontend runs on:
   - `http://localhost:3000`

## API Endpoints

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`

### Projects (JWT Protected)
- `POST /api/projects` (ADMIN)
- `GET /api/projects`
- `POST /api/projects/{id}/members` (ADMIN)
- `DELETE /api/projects/{id}` (ADMIN)

### Tasks (JWT Protected)
- `POST /api/tasks` (ADMIN)
- `GET /api/tasks/project/{projectId}`
- `PUT /api/tasks/{id}` (ADMIN can edit full task, MEMBER can update status)
- `DELETE /api/tasks/{id}` (ADMIN)
- `GET /api/tasks/overdue`

### Dashboard (JWT Protected)
- `GET /api/dashboard`

Returns:
- total tasks
- tasks by status
- overdue tasks count
- my assigned tasks

## Auth Flow

- Login/signup response returns JWT token + user details.
- Frontend stores JWT in `localStorage`.
- Axios interceptor attaches `Authorization: Bearer <token>` on every request.
- Protected routes redirect unauthenticated users to `/login`.

## Notes

- CORS allows `http://localhost:3000`.
- Validation includes email format, min password length (6), and non-empty fields.
- Proper HTTP status codes and error messages are returned from backend handlers.
update 
