-- =====================
-- USERS & AUTH
-- =====================

CREATE TABLE profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role              TEXT NOT NULL DEFAULT 'student',     -- 'student' | 'teacher' | 'admin'
  username          TEXT UNIQUE NOT NULL,
  full_name         TEXT NOT NULL,
  university        TEXT,
  avatar_url        TEXT,
  -- Student fields
  year_of_study     INT,                                 -- 1 to 7
  specialty         TEXT,                                -- 'Medicine' | 'Dentistry' | 'Pharmacy'
  xp                INT DEFAULT 0,
  level             INT DEFAULT 1,
  streak            INT DEFAULT 0,
  last_active       DATE,
  -- Teacher fields
  department        TEXT,
  faculty_id        TEXT,
  status            TEXT DEFAULT 'active',               -- 'pending' | 'active' | 'suspended'
  -- Subscription
  plan              TEXT DEFAULT 'free',                 -- 'free' | 'premium' | 'pro' | 'classe' | 'institution'
  plan_expires_at   TIMESTAMPTZ,
  stripe_customer_id TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- TEACHER CLASSES
-- =====================

CREATE TABLE classes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  university  TEXT,
  year_level  INT,
  specialty   TEXT,
  join_code   TEXT UNIQUE NOT NULL,  -- 6-char alphanumeric e.g. MED4DZ
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE class_students (
  class_id    UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (class_id, student_id)
);

-- =====================
-- VOCABULARY
-- =====================

CREATE TABLE words (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fr_term        TEXT NOT NULL,
  en_term        TEXT NOT NULL,
  en_definition  TEXT NOT NULL,
  en_example     TEXT,
  phonetic       TEXT,
  audio_url      TEXT,
  body_system    TEXT NOT NULL,
  year_level     INT,
  specialty      TEXT[],
  difficulty     TEXT DEFAULT 'medium',   -- 'easy' | 'medium' | 'hard'
  word_root      TEXT,
  prefix         TEXT,
  suffix         TEXT,
  tags           TEXT[],
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE decks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fr     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  description TEXT,
  body_system TEXT,
  year_level  INT,
  cover_emoji TEXT DEFAULT '📚',
  word_count  INT DEFAULT 0,
  created_by  UUID REFERENCES profiles(id),
  is_public   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE deck_words (
  deck_id  UUID REFERENCES decks(id) ON DELETE CASCADE,
  word_id  UUID REFERENCES words(id) ON DELETE CASCADE,
  position INT,
  PRIMARY KEY (deck_id, word_id)
);

-- =====================
-- PRACTICE CONTENT
-- =====================

CREATE TABLE pronunciation_exercises (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_id         UUID REFERENCES words(id),
  target_text     TEXT NOT NULL,
  target_phonetic TEXT,
  audio_url       TEXT NOT NULL,
  difficulty      TEXT DEFAULT 'medium',
  body_system     TEXT,
  year_level      INT,
  tip             TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE listening_exercises (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description_fr  TEXT,
  audio_url       TEXT NOT NULL,
  transcript      TEXT NOT NULL,
  duration_sec    INT,
  difficulty      TEXT DEFAULT 'medium',
  body_system     TEXT,
  year_level      INT,
  questions       JSONB NOT NULL,  -- [{question, options[], correct_index, explanation}]
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE writing_exercises (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  prompt_fr     TEXT NOT NULL,
  prompt_en     TEXT NOT NULL,
  exercise_type TEXT NOT NULL,    -- 'fill_blank' | 'short_answer' | 'case_summary' | 'prescription'
  template      TEXT,
  model_answer  TEXT,
  keywords      TEXT[],
  body_system   TEXT,
  year_level    INT,
  difficulty    TEXT DEFAULT 'medium',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- CLINICAL CASES
-- =====================

CREATE TABLE clinical_cases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_fr        TEXT NOT NULL,
  title_en        TEXT NOT NULL,
  body_system     TEXT NOT NULL,
  year_level      INT,
  difficulty      TEXT DEFAULT 'medium',
  fr_text         TEXT NOT NULL,
  en_text         TEXT NOT NULL,
  glossary        JSONB,   -- {"infarctus": {"en": "MI", "def": "..."}}
  questions       JSONB,   -- [{question, options[], correct_index, explanation}]
  cover_image_url TEXT,
  read_time_min   INT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- USER PROGRESS
-- =====================

CREATE TABLE user_word_progress (
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  word_id       UUID REFERENCES words(id) ON DELETE CASCADE,
  srs_level     INT DEFAULT 0,
  ease_factor   FLOAT DEFAULT 2.5,
  interval_days INT DEFAULT 1,
  next_review   DATE DEFAULT CURRENT_DATE,
  times_seen    INT DEFAULT 0,
  times_correct INT DEFAULT 0,
  last_seen     TIMESTAMPTZ,
  PRIMARY KEY (user_id, word_id)
);

CREATE TABLE pronunciation_attempts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES pronunciation_exercises(id),
  transcript  TEXT,
  score       INT,
  passed      BOOLEAN,
  xp_earned   INT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE listening_attempts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES listening_exercises(id),
  answers     JSONB,
  score       INT,
  xp_earned   INT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE writing_submissions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_id      UUID REFERENCES writing_exercises(id),
  assignment_id    UUID,    -- references assignments(id) — set after that table is created
  content          TEXT NOT NULL,
  auto_score       INT,
  teacher_score    INT,
  teacher_feedback TEXT,
  status           TEXT DEFAULT 'submitted',  -- 'submitted' | 'reviewed'
  xp_earned        INT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quiz_results (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  deck_id       UUID REFERENCES decks(id),
  assignment_id UUID,
  body_system   TEXT,
  score         INT,
  xp_earned     INT,
  time_taken    INT,
  answers       JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE game_scores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  game_type  TEXT NOT NULL,
  score      INT,
  xp_earned  INT,
  duration   INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- GAMIFICATION
-- =====================

CREATE TABLE xp_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount       INT NOT NULL,
  source       TEXT NOT NULL,  -- 'flashcard'|'quiz'|'game'|'streak'|'daily_challenge'|...
  reference_id UUID,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leaderboard_weekly (
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  week_start    DATE NOT NULL,
  xp_earned     INT DEFAULT 0,
  games_played  INT DEFAULT 0,
  words_learned INT DEFAULT 0,
  rank          INT,
  PRIMARY KEY (user_id, week_start)
);

CREATE TABLE user_badges (
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id  TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE saved_words (
  user_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  word_id  UUID REFERENCES words(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, word_id)
);

CREATE TABLE translate_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  input_text  TEXT,
  input_lang  TEXT,
  output_text TEXT,
  from_db     BOOLEAN,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- TEACHER ASSIGNMENTS
-- =====================

CREATE TABLE assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  class_id    UUID REFERENCES classes(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  type        TEXT NOT NULL,   -- 'quiz'|'flashcards'|'pronunciation'|'listening'|'writing'|'case'
  content_id  UUID,
  due_date    TIMESTAMPTZ,
  xp_reward   INT DEFAULT 30,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK now that assignments table exists
ALTER TABLE writing_submissions
  ADD CONSTRAINT fk_writing_assignment
  FOREIGN KEY (assignment_id) REFERENCES assignments(id);

ALTER TABLE quiz_results
  ADD CONSTRAINT fk_quiz_assignment
  FOREIGN KEY (assignment_id) REFERENCES assignments(id);

-- =====================
-- DUEL (REAL-TIME)
-- =====================

CREATE TABLE duel_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id  UUID REFERENCES profiles(id),
  player2_id  UUID REFERENCES profiles(id),
  status      TEXT DEFAULT 'waiting',   -- 'waiting' | 'active' | 'finished'
  winner_id   UUID REFERENCES profiles(id),
  body_system TEXT,
  rounds      JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

-- =====================
-- SUBSCRIPTIONS
-- =====================

CREATE TABLE subscriptions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan           TEXT NOT NULL,
  status         TEXT DEFAULT 'active',  -- 'active' | 'cancelled' | 'expired' | 'trial'
  started_at     TIMESTAMPTZ DEFAULT NOW(),
  expires_at     TIMESTAMPTZ,
  payment_method TEXT,
  stripe_sub_id  TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE usage_daily (
  user_id             UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date                DATE DEFAULT CURRENT_DATE,
  translator_count    INT DEFAULT 0,
  pronunciation_count INT DEFAULT 0,
  listening_count     INT DEFAULT 0,
  duels_count         INT DEFAULT 0,
  flashcards_count    INT DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

CREATE TABLE promo_codes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT UNIQUE NOT NULL,
  plan         TEXT NOT NULL,
  duration_days INT NOT NULL,
  max_uses     INT,
  used_count   INT DEFAULT 0,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE promo_redemptions (
  user_id     UUID REFERENCES profiles(id),
  code_id     UUID REFERENCES promo_codes(id),
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, code_id)
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile full access" ON profiles
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Authenticated users read profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Words public read" ON words
  FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Decks public read" ON decks
  FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own progress" ON user_word_progress
  USING (auth.uid() = user_id);

ALTER TABLE writing_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own submissions" ON writing_submissions
  USING (auth.uid() = user_id);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teacher manages own classes" ON classes
  USING (auth.uid() = teacher_id);
CREATE POLICY "Students read joined classes" ON classes
  FOR SELECT USING (
    id IN (SELECT class_id FROM class_students WHERE student_id = auth.uid())
  );

ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Student reads own class membership" ON class_students
  FOR SELECT USING (auth.uid() = student_id);

ALTER TABLE leaderboard_weekly ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leaderboard public read" ON leaderboard_weekly
  FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE xp_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own XP log" ON xp_log
  USING (auth.uid() = user_id);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own badges read" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE saved_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own saved words" ON saved_words
  USING (auth.uid() = user_id);

ALTER TABLE translate_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own translate history" ON translate_history
  USING (auth.uid() = user_id);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teacher manages own assignments" ON assignments
  USING (auth.uid() = teacher_id);
CREATE POLICY "Students read class assignments" ON assignments
  FOR SELECT USING (
    class_id IN (SELECT class_id FROM class_students WHERE student_id = auth.uid())
  );

ALTER TABLE usage_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own usage" ON usage_daily
  USING (auth.uid() = user_id);
