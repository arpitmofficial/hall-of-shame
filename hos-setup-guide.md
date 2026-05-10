# 🏆 Hall of Shame — Project Documentation

> Roommate rivalry, officially documented. FIFA scores, bath counts, admin-verified drama.
> **Last updated: 10 May 2026**

---

## 🗂️ Project Overview

**Hall of Shame** is a MERN stack web app for tracking competitive stats between roommates. It supports two core modes:

1. **FIFA Mode** — Log head-to-head match scores, edit them, and see aggregate wins/losses/draws/goals with a full stats table.
2. **Competitions Mode** — Create any custom challenge (bath count, gym sessions, dish duty) where users self-report events that require admin approval before they count.

The **Council of Bros** (admin friends) has the final say on whether your claim is real or not.

---

## 🛠️ Tech Stack

| Layer | Technology | Hosted On |
|---|---|---|
| Frontend | React 19 + Vite | Vercel (pending) |
| Backend | Node.js + Express | Render (pending) |
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
│   │   ├── User.js                    ✅ Player/Admin roles, bcrypt hashing
│   │   ├── Match.js                   ✅ FIFA match, auto result calc, no-next() hook
│   │   ├── Competition.js             ✅ Custom challenges, active toggle
│   │   └── Log.js                     ✅ Event claims with approval status
│   ├── controllers/
│   │   ├── authController.js          ✅ Register, Login, GetMe, GetUsers
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
│   ├── server.js                      ✅
│   └── .env                           ✅ (not in git)
│
└── frontend/
    └── src/
        ├── context/
        │   ├── AuthContext.jsx        ✅ JWT persistence + global user state
        │   └── ToastContext.jsx       ✅ Global toast notification system
        ├── services/
        │   └── api.js                 ✅ All Axios calls + JWT interceptor
        ├── pages/
        │   ├── Login.jsx              ✅ Register + Login toggle
        │   ├── Home.jsx               ✅ Shame Banner + FIFA Leaderboard + Recent Matches
        │   ├── FIFA.jsx               ✅ Match list, Stats table, Log modal, Edit modal
        │   ├── Competitions.jsx       ✅ Active/Ended sections, My stats, Log filter, Claim, Create, Admin toggle
        │   └── AdminPanel.jsx         ✅ Claims / Matches / Competitions / Members tabs
        ├── App.jsx                    ✅ Routing, Nav, Private + Admin route guards, ToastProvider
        └── index.css                  ✅ Full dark neon design system
```

---

## ✅ Fully Implemented Features

### 🔐 Auth System
- [x] Register with name, email, password, role (`player` / `admin`)
- [x] Login with JWT token (stored in `localStorage` as `hos_token`)
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
- [x] **Aggregate Stats** per player:
  - Wins, Draws, Losses, Goals For, Goals Against, Goal Difference, Win Rate (%)
- [x] Stats Table tab with rank column (# + 👑 / 😬 icons)
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
- [x] Toast feedback for claim submission (info pill if pending, success if auto-approved)

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
- [x] **Inline edit** any match score (without changing players)
- [x] **Delete** any match as admin
- [x] Shows player names, score, and date
- [x] Toast on every action

#### 🎯 Competitions Tab
- [x] View all competitions with active/ended status
- [x] **Toggle active/inactive** from the admin panel directly
- [x] Shows approval requirement and semester info

#### 👥 Members Tab
- [x] Full list of all registered users
- [x] Admins listed first with 👮 icon + purple "ADMIN" badge
- [x] Players listed below with ⚽ icon + green "PLAYER" badge
- [x] Shows name, email, and "(you)" for the logged-in user
- [x] Visible only to admin role

### 🔔 Toast Notifications
- [x] Global toast system via `ToastContext`
- [x] Three types: `success` (green), `error` (red), `info` (purple)
- [x] Auto-dismiss after 3.5 seconds
- [x] Slide-in animation from the right
- [x] Click to dismiss early
- [x] Used on: match log, match edit, match delete, competition create, claim submit, claim approve/reject, competition toggle

### 🎨 UI / Design
- [x] Full dark mode design system (`--bg`, `--accent` red/orange, neon greens/reds/purples)
- [x] `Bebas Neue` font for titles, `Inter` for body (Google Fonts)
- [x] Animated hover states on cards, buttons, leaderboard rows
- [x] Responsive layout (mobile-friendly, breakpoint at 700px)
- [x] Status pills: pending/approved/rejected, win/draw/loss, admin/player
- [x] Loading spinners and empty state illustrations with emoji
- [x] Modal overlays with click-outside-to-close
- [x] "Shame Banner" with red gradient highlight for the losing player

---

## ❌ Still To Do (Backlog)

### Medium Priority
- [ ] **Forgot Password / Reset Password** flow
- [ ] **Real-time notifications** — browser toast when admin approves your claim (currently requires refresh to see status change)
- [ ] **Participant filter** — only show competitions you're added to on the Competitions page

### Nice-to-Have
- [ ] **Profile page** — view your own stats, change display name
- [ ] **Avatar support** — profile picture via Cloudinary free tier
- [ ] **Activity feed** on Home — "Arpit logged a match · Roommate claimed a bath ..."
- [ ] **Daily heatmap** — calendar view for bath/gym/match activity
- [ ] **Shame Points system** — auto-assign shame score based on losses + missed claims
- [ ] **Push notifications** via Web Push API
- [ ] **Dark/light mode toggle**
- [ ] **Competition history** — archive ended competitions with frozen final standings

---

## 🐛 Bugs Fixed

| Bug | Root Cause | Fix Applied |
|---|---|---|
| "next is not a function" on register | Mongoose 8 async pre-save hooks don't receive `next` callback | Removed `next` param, just `return` from async function |
| "next is not a function" on match log | Same Mongoose 8 issue in `Match.js` synchronous pre-save | Same fix |
| Approve button in Council not working | `log.save()` + chained `.populate()` unreliable in Mongoose 8 | Switched to `findByIdAndUpdate(..., { returnDocument: 'after' }).populate(...)` |
| `{ new: true }` deprecation warning | Deprecated in Mongoose 8 | Replaced with `{ returnDocument: 'after' }` |
| Stats not refreshing after match delete | Delete only filtered local state | Added `getStats()` call after delete |
| "useNavigate is not available" | AuthProvider wrapped BrowserRouter instead of vice versa | Moved BrowserRouter to outermost wrapper |

---

## 🚀 Deployment (Pending)

### Step 1: Update API base URL

In `frontend/src/services/api.js`:
```js
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});
```

In `frontend/.env.local` (for local dev, already works):
```
VITE_API_URL=http://localhost:5000/api
```

### Step 2: Deploy Backend → Render

1. Push repo to GitHub
2. [render.com](https://render.com) → **New → Web Service**
3. Connect GitHub repo
4. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add **Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://...your Atlas URI...
   JWT_SECRET=change_this_to_something_strong
   JWT_EXPIRE=30d
   NODE_ENV=production
   PORT=5000
   ```
6. Deploy → get URL like `https://hall-of-shame-api.onrender.com`

> ⚠️ Free Render instances spin down after 15 min of inactivity. First cold-start takes ~30s.

### Step 3: Deploy Frontend → Vercel

1. [vercel.com](https://vercel.com) → **New Project** → Import GitHub repo
2. Settings:
   - **Framework:** Vite
   - **Root Directory:** `frontend`
3. Add **Environment Variable**:
   ```
   VITE_API_URL=https://hall-of-shame-api.onrender.com/api
   ```
4. Deploy → get URL like `https://hall-of-shame.vercel.app`

### Step 4: Fix CORS for Production

In `backend/server.js`:
```js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://hall-of-shame.vercel.app', // your actual Vercel URL
  ],
  credentials: true,
}));
```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login, returns JWT |
| GET | `/api/auth/me` | Player | Get current user |
| GET | `/api/auth/users` | Player | Get all users (dropdowns) |
| GET | `/api/matches` | Player | Get all matches |
| POST | `/api/matches` | Player | Log a new match |
| PUT | `/api/matches/:id` | Player | Edit match score + notes |
| GET | `/api/matches/stats` | Player | Aggregate stats per player |
| DELETE | `/api/matches/:id` | Player | Delete a match |
| GET | `/api/competitions` | Player | List all competitions |
| POST | `/api/competitions` | Player | Create a competition |
| GET | `/api/competitions/:id` | Player | Get single competition |
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

### Test Accounts (local DB)
| Name | Email | Password | Role |
|---|---|---|---|
| Arpit | arpit@hos.com | password123 | Player |
| Roommate | roommate@hos.com | password123 | Player |
| Admin Bro | admin@hos.com | password123 | Admin |

---

*Built with chaos, competitive energy, and a questionable number of FIFA rematches. 🏆*
