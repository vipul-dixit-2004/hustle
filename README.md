# Hustle 🚀

A minimalist habit tracker to help you build consistency and achieve your goals.

## Features

- ✅ **Daily Habit Tracking** — Check off habits with a simple click
- 📊 **Progress Charts** — Visualize your completion rates over time
- 🔥 **Streak Tracking** — Build momentum with consecutive day streaks
- 🏆 **Perfect Days** — Celebrate days where you complete all habits
- 📱 **Mobile Responsive** — Works great on any device
- 🔒 **Secure Auth** — Powered by Supabase authentication

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Charts:** Recharts
- **Icons:** Lucide React

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd hustle
npm install
```

### 2. Configure Supabase

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Actions table
CREATE TABLE IF NOT EXISTS public.actions (
  action_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_title text NOT NULL,
  month text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Completions table
CREATE TABLE IF NOT EXISTS public.action_completions (
  completion_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id uuid NOT NULL,
  user_id uuid NOT NULL,
  year smallint NOT NULL,
  month smallint NOT NULL CHECK (month BETWEEN 1 AND 12),
  day smallint NOT NULL CHECK (day BETWEEN 1 AND 31),
  completed boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_action_day UNIQUE (action_id, year, month, day)
);

-- Indexes
CREATE INDEX idx_actions_user_id ON public.actions(user_id);
CREATE INDEX idx_completions_user_month ON public.action_completions(user_id, year, month);
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
hustle/
├── app/
│   ├── page.tsx          # Landing page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── dashboard/        # Main dashboard
├── components/
│   └── ActionTracker/    # Habit tracking components
├── lib/
│   └── supabase/         # Supabase client & services
└── docs/
    └── ActionTracker-TechDoc.md
```

## License

MIT
