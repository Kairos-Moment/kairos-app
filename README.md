# Kairos: Time Management 🕰️

**Kairos** (Ancient Greek: καιρός) represents the opportune moment. This app is designed to help you manage your time and move away from the "grind" and into a rhythmic, purposeful way of living. It transforms habit tracking into a digital garden and task management into a focused practice.

---

## ✨ Features

### 🌿 Garden of Habits
- **Long-Term Growth**: Traditional trackers are binary (did it/didn't it). Kairos supports **Target Counts** across different periods:
  - **Daily**: Your constant rhythms.
  - **Weekly**: Goals like "Exercise 3 times a week."
  - **Monthly**: Larger aspirations like "Read 2 books this month."
- **Progress Tracking**: Visual progress bars show you exactly how close you are to your goals.

### 🔮 The Oracle
- **Priority Filtering**: The Oracle analyzes your task list and highlights the most urgent priorities, filtering out the noise.
- **Dynamic Insights**: Get real-time feedback on your habits and productivity patterns.

### ⏲️ Focus Space
- **Immersion**: A dedicated session timer to help you enter a state of deep work.
- **Productivity Tracking**: Every minute spent in focus is automatically logged and visualized in your reports.
- **🎵 Jellyfin Music Streaming**: Stream your personal music library during focus sessions via Jellyfin.
- **Multi-Source Playback**: YouTube, Jellyfin, custom uploads, and ambient sounds—all in one unified player.

### 🎤 Voice Integration
- **Hands-Free Logging**: Use the integrated **Web Speech API** to log habits via voice commands. Just tell the Oracle "Log reading habit" and watch your garden grow.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), CSS Modules, `date-fns` for period logic.
- **Backend**: Node.js, Express, Passport.js (GitHub OAuth).
- **Database**: PostgreSQL (Persistence for users, habits, logs, and tasks).
- **Music Streaming**: Jellyfin (Self-hosted media server with Docker).
- **Hosting**: Render (Web Service + Managed PostgreSQL).
- **Mobile**: https://github.com/Kairos-Moment/kairos-mobile

---

## 🚀 Getting Started

### Music Player Setup

To use Jellyfin music streaming during Focus Session:

1. **Start Jellyfin**:
   ```bash
   docker compose up -d
   ```
2. **Complete first-run setup** at [http://localhost:8096](http://localhost:8096):
   - Create an admin account
   - Add a music library pointing to `/media` (maps to `./media` in the project root)
   - Place your music files in the `./media` folder before or after setup
3. **Create an API key** in Jellyfin: Dashboard → Advanced → API Keys → Add
4. **Add to your `.env`**:
   ```env
   JELLYFIN_URL=http://localhost:8096
   JELLYFIN_API_KEY=your_api_key_here
   JELLYFIN_USER_ID=          # optional, auto-resolved if blank
   ```

### Local Development

1. **Clone the repo.**
2. **Environment Setup**: Create a `.env` file in the root with:
   ```env
   DATABASE_URL=your_postgres_url
   GITHUB_CLIENT_ID=your_id
   GITHUB_CLIENT_SECRET=your_secret
   GITHUB_CALLBACK_URL=http://localhost:5001/api/auth/github/callback
   CLIENT_URL=http://localhost:5173
   SESSION_SECRET=your_secret
   
   # Jellyfin (optional, for Focus Session music streaming)
   JELLYFIN_URL=http://localhost:8096
   JELLYFIN_API_KEY=your_api_key_here
   JELLYFIN_USER_ID=
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   npm run install-all  # (If using a root script) or cd backend && npm install, cd frontend && npm install
   ```
4. **Start Jellyfin** (optional but recommended for music streaming):
   ```bash
   docker-compose up -d
   ```
5. **Run**:
   ```bash
   npm run dev
   ```

---

## 🛠️ Troubleshooting

### 1. "Be careful! The redirect_uri is not associated..." (GitHub Login)
- **Cause**: The `GITHUB_CALLBACK_URL` in your `.env` doesn't match the one registered in your GitHub Developer Settings.
- **Fix**: Ensure your GitHub OAuth App's "Authorization callback URL" is exactly:
  `https://your-backend-service.onrender.com/api/auth/github/callback` (for production)
  or `http://localhost:5001/api/auth/github/callback` (for local).

### 2. Slow Initial Load (Render Cold Start)
- **Problem**: The app takes 30-60 seconds to open the first time.
- **Reason**: Render's **Free Tier** spins down the server after 15 minutes of inactivity. The delay is the server waking up. Once awake, performance will be snappy.

### 3. Habits or Tasks "Stuck"
- **Fix**: Check your database connection. If using the Render Free PostgreSQL tier, ensure you haven't hit the **100 connection limit**. Restarting the backend service usually clears stale connections.

### 4. Voice Commands Not Working
- **Fix**: Ensure you are using a supported browser (Chrome is recommended) and have granted microphone permissions to the site. Voice commands require an active internet connection for the Web Speech API.


