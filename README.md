# FullStack Rating Platform — **MySQL** Edition
Backend: **Express.js + Prisma + MySQL** | Frontend: **React + Vite**

## Requirements covered
- Roles: System Administrator, Normal User, Store Owner
- Single login (JWT), role-protected routes & dashboards
- Admin: add users/stores (API), dashboard metrics, lists with filters & sorting, user detail incl. owner avg rating
- User: signup/login/change password, browse/search stores, submit/modify rating (1–5), see overall & my rating
- Owner: see average rating + users who rated their stores
- Validations: Name 20–60, Address ≤400, Password 8–16 with uppercase + special, Email format

## 1) Setup MySQL
Install MySQL 8.0+ and create DB:
```
mysql -u root -p -e "CREATE DATABASE rating_app;"
```
Set `backend/.env` (copy from example):
```
DATABASE_URL="mysql://root:password@localhost:3306/rating_app"
JWT_SECRET="change_me"
PORT=4000
```

## 2) Backend
```
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed      # seeds admin/owner/user and one sample store
npm run dev              # http://localhost:4000
```
Seeded creds: admin@example.com / Admin@123, owner@example.com / Owner@123, user@example.com / User@123

## 3) Frontend
```
cd frontend
npm install
npm run dev              # http://localhost:5173
```
Optional `frontend/.env`:
```
VITE_API_BASE=http://localhost:4000
```

## 4) API (quick)
- POST /api/auth/signup | /login | /change-password
- GET /api/stores (search + overall & my rating)
- POST /api/stores/:id/ratings (1..5)
- ADMIN: POST /api/admin/users, POST /api/admin/stores, GET /api/admin/metrics, GET /api/admin/users, GET /api/admin/stores, GET /api/admin/users/:id
- OWNER: GET /api/owner/ratings

## Notes
- Prisma targets MySQL; you can switch to Postgres later by changing provider/url & re-migrating.
- For production: secure JWT secret, HTTPS, rate limiting, CORS whitelist, logs.
