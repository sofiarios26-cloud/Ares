# ARES

Mobile-first PWA built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

## Stack

- **React 19** + **TypeScript**
- **Vite 8**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **PWA** (`vite-plugin-pwa`)
- **Supabase** (`@supabase/supabase-js`)

## Project structure

```
src/
├── components/
│   ├── ui/           # Design system (Button, Card, Modal, …)
│   ├── layout/       # MobileShell, AppShell, AuthLayout
│   └── icons/
├── pages/            # Splash, Welcome, Login, Home, Profile, …
├── router/           # React Router setup
├── hooks/
├── services/
├── utils/
└── types/
```

## UI flow

| Route        | Screen                          |
| ------------ | --------------------------------- |
| `/splash`    | Animated splash → auto redirect   |
| `/welcome`   | Onboarding CTAs                   |
| `/login`     | Auth form (mock submit → home)    |
| `/register`  | Sign up form                      |
| `/`          | Home feed + product cards         |
| `/profile`   | Profile placeholder               |
| `/discover`  | Explore placeholder               |
| `/saved`     | Saved placeholder                 |

Bottom navigation: Instagram/TikTok-style bar with elevated gold **+** action.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

   Fill in your Supabase project URL and anon key from the [Supabase dashboard](https://supabase.com/dashboard).

3. Run the database migration in Supabase SQL Editor — see [`supabase/README.md`](supabase/README.md) for full setup (schema, RLS, storage, Google OAuth, redirect URLs).

4. Run the dev server:

   ```bash
   npm run dev
   ```

5. Build for production:

   ```bash
   npm run build
   npm run preview
   ```

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start dev server + PWA   |
| `npm run build`   | Type-check and build     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |
