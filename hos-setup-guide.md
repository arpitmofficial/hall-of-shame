# 🏆 Hall of Shame — Project Documentation

> Roommate rivalry, officially documented. FIFA scores, bath counts, admin-verified drama.
> **Last updated: 11 May 2026**

---

## 🌐 Live Deployment

| Service | URL |
|---|---|
| **Frontend (Vercel)** | https://hall-of-shame-nine.vercel.app |
| **Backend (Render)** | https://hall-of-shame-sfy9.onrender.com |
| **GitHub** | https://github.com/arpitmofficial/hall-of-shame |

> ⚠️ Render free tier spins down after 15 min of inactivity. First request after sleep takes ~30s.

---

## 🗂️ Project Overview

**Hall of Shame** is a MERN stack web app for tracking competitive stats between roommates. It supports two core modes:

1. **FIFA Mode** — Log head-to-head match scores, edit them, and see aggregate wins/losses/draws/goals with a full stats table.
2. **Competitions Mode** — Create any custom challenge (bath count, gym sessions, dish duty) where users self-report events that require admin approval before they count.

The **Council of Bros** (admin friends) has the final say on whether your claim is real or not.

> No email anywhere. Login is by **phone number + password** only — one account per number, keeps it tight.

---

## 🛠️ Tech Stack

| Layer | Technology | Hosted On |
|---|---|---|
| Frontend | React 19 + Vite | Vercel |
| Backend | Node.js + Express 5 | Render |
| Database | MongoDB Atlas (Free M0) | Atlas Cloud |
| Auth | JWT + bcryptjs | — |
| HTTP Client | Axios | — |
| Router | React Router v7 | — |

---

## 📁 Project Structure

```
hall-of-shame/
├── backend/
│   ├── config/
│   │   └── db.js                      ✅ MongoDB connection
│   ├── models/
│   │   ├── User.js                    ✅ phone (unique) + password + role (no email)
│   │   ├── Match.js                   ✅ FIFA match, auto result calc
│   │   ├── Competition.js             ✅ Custom challenges, active toggle
│   │   └── Log.js                     ✅ Event claims with approval status
│   ├── controllers/
│   │   ├── authController.js          ✅ Register/Login by phone, GetMe, GetUsers
│   │   ├── matchController.js         ✅ CRUD + Edit + aggregate stats
│   │   ├── competitionController.js   ✅ CRUD + toggle active/inactive
│   │   └── logController.js           ✅ Claim, Review (approve/reject), Scoreboard
│   ├── routes/
│   │   ├── authRoutes.js              ✅
│   │   ├── matchRoutes.js             ✅ GET/POST/PUT/DELETE
│   │   ├── competitionRoutes.js       ✅ GET/POST + toggle
│   │   └── logRoutes.js               ✅ GET/POST + review + scoreboard
│   ├── middleware/
│   │   └── authMiddleware.js          ✅ protect + adminOnly guards
│   ├── server.js                      ✅ CORS whitelists localhost + Vercel URL
│   └── .env                           ✅ (not in git)
│
└── frontend/
    └── src/
        ├── context/
        │   ├── AuthContext.jsx        ✅ JWT persistence + global user state
        │   └── ToastContext.jsx       ✅ Global toast notification system
        ├── services/
        │   └── api.js                 ✅ All Axios calls + JWT interceptor + VITE_API_URL env
        ├── pages/
        │   ├── Login.jsx              ✅ Phone + Password login/register (no email)
        │   ├── Home.jsx               ✅ Shame Banner + FIFA Leaderboard + Recent Matches
        │   ├── FIFA.jsx               ✅ Match list, Stats table, Log modal, Edit modal
        │   ├── Competitions.jsx       ✅ Active/Ended sections, My stats, Log filter, Claim, Create, Admin toggle
        │   └── AdminPanel.jsx         ✅ Claims / Matches / Competitions / Members tabs (shows phone)
        ├── App.jsx                    ✅ Routing, Nav, Private + Admin route guards, ToastProvider
        └── index.css                  ✅ Full dark neon design system
```

---

## ✅ Fully Implemented Features

### 🔐 Auth System
- [x] Register with name, **phone number**, password, role (`player` / `admin`)
- [x] Login with **phone number + password** — no email anywhere in the project
- [x] Phone is the unique identifier — prevents multi-account abuse
- [x] JWT token stored in `localStorage` as `hos_token`
- [x] Auto-login on refresh via `/api/auth/me`
- [x] Logout clears token and redirects to `/login`
- [x] Protected routes — non-logged-in users redirected to login
- [x] Admin-only routes — non-admins redirected to home
- [x] JWT attached to every request via Axios interceptor

### ⚽ FIFA Arena
- [x] Log a head-to-head match (Player 1 vs Player 2, goals each side)
- [x] Auto-calculate result (`player1_win` / `player2_win` / `draw`) via Mongoose pre-save hook
- [x] **Edit a match** — change score and notes without changing players
- [x] Delete a match (stats auto-refresh after delete)
- [x] Optional notes field per match (e.g. "Lag doesn't count")
- [x] Color-coded player names by result (green = winner, red = loser, yellow = draw)
- [x] **Aggregate Stats** per player: W / D / L / GF / GA / GD / Win%
- [x] Stats Table tab with rank column
- [x] "Hall of Shame" banner on Home showing the current loser
- [x] Toast feedback on all actions (log, edit, delete)

### 🎯 Competitions
- [x] Create a custom competition: title, emoji, description, semester, participants, requiresApproval toggle
- [x] **Active / Ended sections** on the list page (separated visually)
- [x] Toggle `requiresApproval` — if off, claims are auto-approved instantly
- [x] Click a competition card to enter the detail view
- [x] **My stats strip** — shows My Approved count, My Pending count, Total Entries
- [x] **Claim Event** — submit a self-report with optional proof note
- [x] Claims start as `pending` if approval is required
- [x] **Log filter tabs** inside competition detail — All / Pending / Approved / Rejected
- [x] Per-competition **Scoreboard** (only approved entries count, gold/silver/bronze rank)
- [x] Show review note from admin if a claim was rejected
- [x] **Admin Close/Reopen button** inside competition detail view (admin only)
- [x] Toast feedback for claim submission

### 👮 Council Panel (Admin Only) — 4 tabs

#### ⏳ Claims Tab
- [x] View all `pending` log entries from all competitions
- [x] **Approve** a claim — moves it from pending to approved instantly
- [x] **Reject with reason** — admin can add a rejection note
- [x] Sub-tabs: Pending / Approved / Rejected
- [x] Shows competition emoji, user name, timestamp, proof note, and council note
- [x] Empty state: "All clear! Nothing to review 🎉"

#### ⚽ Matches Tab
- [x] View all FIFA matches in a compact list
- [x] **Inline edit** any match score
- [x] **Delete** any match as admin
- [x] Toast on every action

#### 🎯 Competitions Tab
- [x] View all competitions with active/ended status
- [x] **Toggle active/inactive** from the admin panel directly

#### 👥 Members Tab
- [x] Full list of all registered users
- [x] Admins listed first with 👮 icon + purple "ADMIN" badge
- [x] Players listed below with ⚽ icon + green "PLAYER" badge
- [x] Shows name + **phone number** (no email)

### 🔔 Toast Notifications
- [x] Global `ToastContext` — success (green) / error (red) / info (purple)
- [x] Auto-dismiss after 3.5s, slide-in animation, click to dismiss early

### 📱 SMS Notifications (Twilio)
- [x] **Match Logged Alert**: Sends an SMS to the loser when a FIFA match is logged against them.
  - *Example:* "🚨 HALL OF SHAME: Arpit just logged a 4-0 FIFA win against you. Log in to check the damage or file a dispute."
- [x] **New Claim Alert**: Sends an SMS to all Admins when a new pending claim is submitted.
  - *Example:* "👮 COUNCIL DUTY: Roommate just claimed a '🏋️ Gym Sessions'. Open the Council Panel to approve or reject."
- [x] **Claim Reviewed Alert**: Sends an SMS to the user when their claim is approved or rejected by an admin.
  - *Example (Approved):* "✅ CLAIM APPROVED: The Council has verified your '🏋️ Gym Sessions'. You're on the board!"
  - *Example (Rejected):* "❌ CLAIM REJECTED: Your '🏋️ Gym Sessions' was denied. Reason: 'Pics or it didn't happen'."
- [x] Fails silently with a mock console log if Twilio keys aren't present in `.env`.

### 🎨 UI / Design
- [x] Full dark mode design system
- [x] `Bebas Neue` + `Inter` (Google Fonts)
- [x] Animated hover states, modals with click-outside-to-close
- [x] Responsive layout, status pills, loading spinners, empty states
- [x] "Shame Banner" for the losing player on Home

---

## ❌ Still To Do (Backlog)

- [ ] **Real-time claim status** — refresh scoreboard when admin approves without manual reload
- [ ] **Participant filter** — only show competitions you're added to
- [ ] **Profile page** — view your own stats, change display name
- [ ] **Activity feed** on Home — recent events across all features
- [ ] **Daily heatmap** — calendar view for bath/gym/match activity
- [ ] **Shame Points system** — auto-assign shame score based on losses + missed claims
- [ ] **Dark/light mode toggle**
- [ ] **Competition history** — archive ended competitions with frozen final standings

---

## 🐛 Bugs Fixed

| Bug | Root Cause | Fix Applied |
|---|---|---|
| "next is not a function" on register | Mongoose 8 async pre-save hooks don't receive `next` | Removed `next` param |
| Same error on match log | Same issue in `Match.js` | Same fix |
| Approve not working in Council | `log.save()` + chained `.populate()` unreliable in Mongoose 8 | `findByIdAndUpdate(..., { returnDocument: 'after' }).populate(...)` |
| `{ new: true }` deprecation warning | Deprecated in Mongoose 8 | Replaced with `{ returnDocument: 'after' }` |
| Stats not refreshing after match delete | Delete only filtered local state | Added `getStats()` call after delete |
| "useNavigate is not available" | AuthProvider wrapped BrowserRouter | Moved BrowserRouter to outermost wrapper |

---

## 🚀 Deployment

### Backend — Render
- **URL:** https://hall-of-shame-sfy9.onrender.com
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Environment Variables on Render:**
```
MONGODB_URI=mongodb+srv://...your Atlas URI...
JWT_SECRET=your_production_secret
JWT_EXPIRE=30d
NODE_ENV=production
PORT=5000
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
```

### Frontend — Vercel
- **URL:** https://hall-of-shame-nine.vercel.app
- **Root Directory:** `frontend`
- **Framework:** Vite

**Environment Variable on Vercel:**
```
VITE_API_URL=https://hall-of-shame-sfy9.onrender.com/api
```

### CORS Config (`backend/server.js`)
```js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://hall-of-shame-nine.vercel.app',
  ],
  credentials: true,
}));
```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register (name, phone, password, role) |
| POST | `/api/auth/login` | None | Login by phone + password → JWT |
| GET | `/api/auth/me` | Player | Get current user |
| GET | `/api/auth/users` | Player | Get all users (dropdowns) |
| GET | `/api/matches` | Player | Get all matches |
| POST | `/api/matches` | Player | Log a new match |
| PUT | `/api/matches/:id` | Player | Edit match score + notes |
| GET | `/api/matches/stats` | Player | Aggregate stats per player |
| DELETE | `/api/matches/:id` | Player | Delete a match |
| GET | `/api/competitions` | Player | List all competitions |
| POST | `/api/competitions` | Player | Create a competition |
| PUT | `/api/competitions/:id/toggle` | Player | Toggle active/inactive |
| GET | `/api/logs` | Player | Get logs (filter by competition/status/user) |
| POST | `/api/logs` | Player | Claim an event |
| GET | `/api/logs/scoreboard/:compId` | Player | Approved score per user |
| PUT | `/api/logs/:id/review` | **Admin** | Approve or reject a claim |

---

## 🏃 Running Locally

```bash
# Terminal 1 — Backend (port 5000)
cd hall-of-shame/backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd hall-of-shame/frontend
npm run dev
```

Open: **http://localhost:5173**

### `backend/.env` (required for local dev)
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/hall-of-shame
JWT_SECRET=anything_strong
JWT_EXPIRE=30d
PORT=5000

# Twilio (Required for real SMS, otherwise it mocks to console)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
```

### `frontend/.env.local` (optional for local dev)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 👤 User Schema (current)

```js
{
  name:        String   // required
  phone:       String   // required, unique — login identifier (NO email)
  password:    String   // bcrypt hashed, min 6 chars
  role:        String   // 'player' | 'admin', default 'player'
  avatar:      String   // default ''
  shamePoints: Number   // default 0
}
```

---

*Built with chaos, competitive energy, and a questionable number of FIFA rematches. 🏆*
