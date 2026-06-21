export type Role = 'student' | 'teacher' | 'admin'
export type AccountStatus = 'pending' | 'active' | 'suspended'
export type Plan = 'free' | 'premium' | 'pro' | 'classe' | 'institution'

export interface Profile {
  id: string
  role: Role
  username: string
  full_name: string
  university: string | null
  avatar_url: string | null
  // Student
  year_of_study: number | null
  specialty: string | null
  xp: number
  level: number
  streak: number
  last_active: string | null
  // Teacher
  department: string | null
  faculty_id: string | null
  status: AccountStatus
  // Subscription
  plan: Plan
  plan_expires_at: string | null
  created_at: string
}

export interface Word {
  id: string
  fr_term: string
  en_term: string
  en_definition: string
  en_example: string | null
  phonetic: string | null
  audio_url: string | null
  body_system: string
  year_level: number | null
  specialty: string[] | null
  difficulty: 'easy' | 'medium' | 'hard'
  word_root: string | null
  prefix: string | null
  suffix: string | null
  tags: string[] | null
  created_at: string
}

export interface UserWordProgress {
  user_id: string
  word_id: string
  srs_level: number
  ease_factor: number
  interval_days: number
  next_review: string
  times_seen: number
  times_correct: number
  last_seen: string | null
}

export interface Deck {
  id: string
  name_fr: string
  name_en: string
  description: string | null
  body_system: string | null
  year_level: number | null
  cover_emoji: string
  word_count: number
  created_by: string | null
  is_public: boolean
  created_at: string
}

export interface KeyTerm {
  en: string
  fr: string
  def: string
}

export interface AdvancedTopic {
  id: string
  slug: string
  emoji: string
  category: string | null
  title_en: string
  title_fr: string
  summary_en: string | null
  summary_fr: string | null
  content_en: string
  key_terms: KeyTerm[] | null
  difficulty: 'intermediate' | 'advanced' | 'expert'
  created_by: string | null
  created_at: string
}

export interface Video {
  id: string
  title: string
  description: string | null
  url: string
  thumbnail_url: string | null
  topic: string | null
  language: string
  duration_min: number | null
  created_by: string | null
  created_at: string
}

export interface Course {
  id: string
  title: string
  description: string | null
  topic: string | null
  cover_emoji: string
  content_url: string | null
  created_by: string | null
  is_published: boolean
  created_at: string
}

export type FavoriteType = 'video' | 'course' | 'word' | 'topic'

export interface Favorite {
  id: string
  user_id: string
  item_type: FavoriteType
  item_id: string
  created_at: string
}
