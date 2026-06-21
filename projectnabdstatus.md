---
name: project-nabed-status
description: "Build state, what's done vs. pending, architecture decisions for the Nabed medical English app"
metadata: 
  node_type: memory
  type: project
  originSessionId: 62705e91-1774-4e60-909d-98a1c82083a4
---

# Nabed Project Status (updated 2026-06-16)

Nabed is a full-stack gamified Medical English learning app (French → English bridge) for Algerian medical students and teachers. Tech stack: Next.js 14 App Router, TypeScript, Tailwind CSS v3, Supabase (auth + DB), Framer Motion.

**Why:** Free, curriculum-aligned, bilingual alternative to paid apps.

## ✅ FULLY BUILT — 43 routes, clean production build

### Auth
- `/auth/login` (forgot password link included)
- `/auth/register` + `/auth/register/student` (3-step) + `/auth/register/teacher` (pending)
- `/auth/pending`, `/auth/callback`, `/auth/forgot-password`, `/auth/reset-password`

### App Shell
- Sidebar (role-based: student/teacher/admin), MobileNav, app layout (server component)

### Student Core
- `/dashboard` — real XP/streak/stats/leaderboard from DB
- `/translate` — real DB search FR↔EN, debounced, save word toggle (API: `/api/translate/search`, `/api/words/save`)
- `/learn` — real body systems with progress bars from DB
- `/learn/[systemSlug]` — word list + 10-question inline quiz (SystemQuiz component)
- `/flashcards` — due cards SRS hub + deck grid
- `/flashcards/[deckId]` — SM-2 flashcard session
- `/profile` — real badges, saved words, XP/level/streak from DB
- `/leaderboard` — real XP rankings, global/university filter (LeaderboardFilter client component)
- `/practice` — hub linking to 3 modes
- `/practice/pronunciation` — Web Speech API SpeechRecognition + Levenshtein scoring
- `/practice/listening` — SpeechSynthesis TTS MCQ
- `/practice/writing` — fill-in-blank with fuzzy check
- `/cases` — clinical cases list (first 2 free, rest Premium-locked)
- `/cases/[caseId]` — bilingual FR+EN reader + key vocabulary

### Games (all with `/api/games/score` XP reward)
- `/games` — hub; Duel + Anatomy Drop marked "Bientôt"
- `/games/anagram` — scramble letters, 30s timer, +10 XP/correct
- `/games/term-blast` — FR→EN MCQ speed quiz, +8 XP
- `/games/word-roots` — identify root/prefix/suffix, +12 XP
- `/games/diagnostic-match` — match FR terms to EN definitions, +15 XP

### Teacher
- `/teacher/dashboard` — stats, classes, upcoming assignments
- `/teacher/classes` — list + NewClassForm (creates class with auto join code)
- `/teacher/classes/[classId]` — student roster with XP/streak, CopyCode button
- `/teacher/assignments` — NewAssignmentForm + assignments list
- `/teacher/reports` — per-class: active today, avg XP, avg streak

### Admin
- `/admin` — overview with real DB counts + links to sub-pages
- `/admin/approvals` — approve/reject pending teachers (client ApprovalActions → `/api/admin/teacher-approval`)
- `/admin/users` — filterable by role, searchable by name
- `/admin/words` — word list with system/search filters + AddWordForm (admin inserts directly)

### API Routes
- `POST /api/flashcards/review` — SM-2 algorithm + XP award
- `GET /api/translate/search` — ilike search words table
- `POST /api/words/save` — toggle saved_words
- `POST /api/games/score` — insert game_scores + award XP
- `POST /api/streak/update` — check last_active, increment or reset streak
- `POST /api/admin/teacher-approval` — approve/reject teacher (admin-only, service role)

## ❌ STILL MISSING (not blocking MVP)

- `/admin/decks` — deck management UI
- `/admin/cases` — clinical case creation UI
- Anatomy Drop game (complex drag-and-drop)
- The Duel (Supabase Realtime multiplayer)
- PWA (next-pwa offline flashcards)
- Stripe subscription enforcement
- Supabase Edge Functions (streak cron, leaderboard refresh, badge triggers)
- Badge award triggers (currently badges only show if row exists in user_badges; nothing writes them yet)

## Key Architecture
- Profiles created server-side in `/auth/callback` via admin client reading `user.user_metadata`
- Teachers gated at callback, login, and app layout (triple-checked)
- SM-2 in `src/lib/srs.ts`, review API upserts user_word_progress
- Games call `/api/games/score` for XP; streak calls `/api/streak/update`
- Admin approval uses service-role client to bypass RLS
- LeaderboardFilter is a client component that updates URL searchParams for server re-fetch
