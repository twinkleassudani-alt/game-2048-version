# 2048 — Premium Edition

> Slide and merge numbered tiles on a grid to reach the legendary 2048 tile. Challenge yourself across 3×3 to 6×6 boards, compete on the global leaderboard, and see how high you can score!

🎮 **Live Demo:** [game-2048-version.vercel.app](https://game-2048-version.vercel.app)

---

## Features

- **4 Grid Sizes** — Play on 3×3, 4×4, 5×5, or 6×6 boards
- **Global Leaderboard** — Scores saved to Supabase, ranked by grid size
- **Player Login** — Enter a display name on first visit; a unique player ID is auto-generated and stored
- **Pause / Resume** — Pause the game at any time; timer stops while paused
- **Undo** — Step back one move
- **Dark / Light Mode** — Persisted across sessions
- **Sound Toggle** — Mute/unmute game sounds
- **Smooth Animations** — Tile slide, pop-in, and merge-bounce animations
- **Touch Support** — Swipe gestures on mobile
- **Keyboard Support** — Arrow keys or WASD to move, Space to pause, Ctrl+Z to undo

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Bundler | Vite |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |

---

## Project Structure

```
src/
├── components/
│   ├── GameBoard.tsx      # Board grid and tile layer
│   ├── GameStats.tsx      # Score, best, moves, timer
│   ├── Header.tsx         # Controls, pause, theme, mute
│   ├── HowToPlay.tsx      # Instructions section
│   ├── Leaderboard.tsx    # Global high scores modal
│   ├── LoginModal.tsx     # Mandatory first-visit login
│   ├── MenuOverlay.tsx    # Game over / win overlay
│   └── TileCard.tsx       # Individual tile rendering
├── hooks/
│   └── use2048.ts         # Core game logic hook
├── lib/
│   └── supabase.ts        # Supabase client
├── utils/
│   ├── audio.ts           # Sound utilities
│   └── types.ts           # Shared TypeScript types
├── App.tsx
└── index.css
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone the repository

```bash
git clone https://github.com/twinkleassudani-alt/game-2048-version.git
cd game-2048-version
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Find these in **Supabase Dashboard → Settings → API**.

### 4. Set up the database

Run the following SQL in **Supabase Dashboard → SQL Editor**:

```sql
-- Players table
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read"   ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.players FOR INSERT WITH CHECK (true);

-- Leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   UUID REFERENCES public.players(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  score       INTEGER NOT NULL,
  max_tile    INTEGER NOT NULL DEFAULT 0,
  grid_size   INTEGER NOT NULL CHECK (grid_size IN (3, 4, 5, 6)),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read"   ON public.leaderboard FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.leaderboard FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS leaderboard_grid_score_idx
  ON public.leaderboard (grid_size, score DESC);
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Deployment (Vercel)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
3. Add environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) under **Settings → Environment Variables**
4. Click **Deploy** — Vercel auto-detects Vite

Every subsequent `git push origin main` triggers an automatic redeployment.

---

## How to Play

| Action | Control |
|--------|---------|
| Move tiles | Arrow keys or WASD |
| Pause / Resume | Space bar or Pause button |
| Undo last move | Ctrl + Z or Undo button |
| New game | New Game button |
| Swipe (mobile) | Swipe in any direction |

Merge tiles with the same number to double their value. Reach the **2048** tile to win — or keep playing to beat your high score!

---

## License

MIT — feel free to fork and build on it.

---

*Built with ❤️ by [twinkleassudani-alt](https://github.com/twinkleassudani-alt)*
