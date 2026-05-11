# 🏆 Hall of Shame

> Roommate rivalry, officially documented.

A full-stack MERN web app for tracking competitive stats between roommates — FIFA head-to-head scores, custom lifestyle challenges (bath counts, gym sessions, dish duty), and an admin-verified approval system for every claim.

**Live URLs:**
- **Frontend**: [https://hall-of-shame-nine.vercel.app](https://hall-of-shame-nine.vercel.app)
- **Backend API**: [https://hall-of-shame-sfy9.onrender.com](https://hall-of-shame-sfy9.onrender.com)

---

## ✨ Features

### ⚽ FIFA Arena
- Log head-to-head matches with auto win/draw/loss calculation
- Edit match scores and notes after the fact
- Full stats table: W / D / L / GF / GA / GD / Win%
- Historical match list with color-coded results

### 🎯 Competitions
- Create any custom challenge with a title, emoji, description, and semester tag
- Toggle admin approval requirement per competition
- Claim events with optional proof notes
- Per-competition scoreboards (only approved entries count)
- Filter entries by status: All / Pending / Approved / Rejected
- Admin can close / reopen competitions

### 👮 Council Panel (Admin only)
- **Claims tab** — Approve or reject pending claims with optional reason
- **Matches tab** — Edit or delete any FIFA match
- **Competitions tab** — Toggle any competition open/closed
- **Members tab** — View all players and admins

### 🔔 UX
- JWT-based auth with auto-login on refresh
- Toast notifications on every action (success / error / info)
- Dark neon design with `Bebas Neue` + `Inter` typography
- Fully responsive layout

---

## 🛠️ Tech Stack

| | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router v7, Axios |
| **Backend** | Node.js, Express 5, Mongoose 9 |
| **Database** | MongoDB Atlas |
| **Auth** | JWT + bcryptjs |
| **Hosting** | Vercel (frontend) + Render (backend) |

---

## 📁 Project Structure

```
hall-of-shame/
├── backend/          # Express API (port 5000)
│   ├── config/       # MongoDB connection
│   ├── controllers/  # Auth, Match, Competition, Log
│   ├── middleware/   # JWT protect + adminOnly
│   ├── models/       # User, Match, Competition, Log
│   ├── routes/       # /api/auth /api/matches /api/competitions /api/logs
│   └── server.js
│
├── frontend/         # React + Vite app (port 5173)
│   └── src/
│       ├── context/  # AuthContext, ToastContext
│       ├── pages/    # Login, Home, FIFA, Competitions, AdminPanel
│       ├── services/ # api.js — all Axios calls
│       └── App.jsx
│
└── hos-setup-guide.md   # Full project documentation & deployment guide
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (free M0 tier works)

### 1. Clone

```bash
git clone https://github.com/arpitmofficial/hall-of-shame.git
cd hall-of-shame
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hall-of-shame
JWT_SECRET=pick_a_strong_random_secret
JWT_EXPIRE=30d
PORT=5000
```

```bash
npm run dev   # starts on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev   # starts on http://localhost:5173
```

> The frontend proxies API calls to `http://localhost:5000/api` by default. No extra config needed for local dev.

---

## 🔑 API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/auth/me` | ✅ | Current user |
| GET | `/api/auth/users` | ✅ | All users |
| GET | `/api/matches` | ✅ | All matches |
| POST | `/api/matches` | ✅ | Log match |
| PUT | `/api/matches/:id` | ✅ | Edit score/notes |
| DELETE | `/api/matches/:id` | ✅ | Delete match |
| GET | `/api/matches/stats` | ✅ | Aggregate stats |
| GET | `/api/competitions` | ✅ | All competitions |
| POST | `/api/competitions` | ✅ | Create competition |
| PUT | `/api/competitions/:id/toggle` | ✅ | Toggle active |
| GET | `/api/logs` | ✅ | All logs (filterable) |
| POST | `/api/logs` | ✅ | Claim event |
| GET | `/api/logs/scoreboard/:id` | ✅ | Scoreboard |
| PUT | `/api/logs/:id/review` | 🔴 Admin | Approve/reject |

---

## 🤝 Contributing

This is a personal project between roommates. PRs are welcome if you somehow care about our FIFA record.

---

## 📄 License

MIT — do whatever you want with it.
