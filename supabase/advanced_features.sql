-- =====================================================================
-- Nabed — Advanced English, Videos, Courses & Favorites
-- Run this in the Supabase SQL editor (idempotent where possible).
-- =====================================================================

-- =====================
-- ADVANCED MEDICAL ENGLISH TOPICS
-- (advanced content not tied to a single university module)
-- =====================
CREATE TABLE IF NOT EXISTS advanced_topics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  emoji       TEXT DEFAULT '🩺',
  category    TEXT,                                  -- e.g. 'Cardiology', 'Pharmacology'
  title_en    TEXT NOT NULL,
  title_fr    TEXT NOT NULL,
  summary_en  TEXT,
  summary_fr  TEXT,
  content_en  TEXT NOT NULL,                         -- the advanced English topic body
  key_terms   JSONB,                                 -- [{ "en": "...", "fr": "...", "def": "..." }]
  difficulty  TEXT DEFAULT 'advanced',               -- 'intermediate' | 'advanced' | 'expert'
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- MEDICAL VIDEOS (added by teachers / admins)
-- =====================
CREATE TABLE IF NOT EXISTS videos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  url           TEXT NOT NULL,                        -- YouTube / Vimeo / mp4
  thumbnail_url TEXT,
  topic         TEXT,                                 -- body system or subject
  language      TEXT DEFAULT 'en',                    -- 'en' | 'fr'
  duration_min  INT,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- COURSES (created by teachers)
-- =====================
CREATE TABLE IF NOT EXISTS courses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  topic        TEXT,
  cover_emoji  TEXT DEFAULT '📘',
  content_url  TEXT,                                  -- optional external link / document
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- FAVORITES (words / videos / courses / topics)
-- =====================
CREATE TABLE IF NOT EXISTS favorites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_type  TEXT NOT NULL,                           -- 'video' | 'course' | 'word' | 'topic'
  item_id    UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, item_type, item_id)
);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE advanced_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites       ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read content
DROP POLICY IF EXISTS "Advanced topics read" ON advanced_topics;
CREATE POLICY "Advanced topics read" ON advanced_topics
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Videos read" ON videos;
CREATE POLICY "Videos read" ON videos
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Courses read" ON courses;
CREATE POLICY "Courses read" ON courses
  FOR SELECT USING (auth.role() = 'authenticated');

-- Teachers & admins manage content
DROP POLICY IF EXISTS "Advanced topics manage" ON advanced_topics;
CREATE POLICY "Advanced topics manage" ON advanced_topics
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher','admin')));

DROP POLICY IF EXISTS "Videos manage" ON videos;
CREATE POLICY "Videos manage" ON videos
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher','admin')));

DROP POLICY IF EXISTS "Courses manage" ON courses;
CREATE POLICY "Courses manage" ON courses
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher','admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher','admin')));

-- Users own their favorites
DROP POLICY IF EXISTS "Own favorites" ON favorites;
CREATE POLICY "Own favorites" ON favorites
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =====================
-- SEED — example advanced topics
-- =====================
INSERT INTO advanced_topics (slug, emoji, category, title_en, title_fr, summary_en, summary_fr, content_en, key_terms, difficulty)
VALUES
(
  'cardiovascular-disorders', '❤️', 'Cardiology',
  'Cardiovascular Disorders', 'Troubles Cardiovasculaires',
  'Advanced English for describing, assessing and discussing cardiovascular disease.',
  'Anglais avancé pour décrire, évaluer et discuter des maladies cardiovasculaires.',
  'Cardiovascular disorders encompass a broad spectrum of conditions affecting the heart and blood vessels, including coronary artery disease, heart failure, arrhythmias and valvular disease. In clinical English, you will frequently present patients with phrases such as "the patient presents with exertional chest pain radiating to the left arm" or "echocardiography revealed a reduced ejection fraction." Mastering the vocabulary of risk stratification, haemodynamics and pharmacological management is essential for case presentations and reading the international literature.',
  '[{"en":"myocardial infarction","fr":"infarctus du myocarde","def":"death of heart muscle due to ischaemia"},{"en":"ejection fraction","fr":"fraction d''éjection","def":"percentage of blood ejected from the ventricle per beat"},{"en":"atrial fibrillation","fr":"fibrillation auriculaire","def":"irregular, often rapid atrial rhythm"}]'::jsonb,
  'advanced'
),
(
  'clinical-pharmacology', '💊', 'Pharmacology',
  'Clinical Pharmacology', 'Pharmacologie Clinique',
  'The language of drug mechanisms, dosing, interactions and adverse effects.',
  'Le langage des mécanismes d''action, posologies, interactions et effets indésirables.',
  'Clinical pharmacology in English requires precision when discussing pharmacokinetics ("absorption, distribution, metabolism and excretion") and pharmacodynamics. You should be comfortable describing dose adjustments ("renal dose adjustment is required"), drug interactions ("concomitant use may potentiate the anticoagulant effect"), and adverse drug reactions. Prescribing language such as "titrate to effect" and "first-line therapy" recurs constantly in guidelines and ward rounds.',
  '[{"en":"half-life","fr":"demi-vie","def":"time for plasma concentration to fall by half"},{"en":"adverse drug reaction","fr":"effet indésirable médicamenteux","def":"a harmful, unintended response to a drug"},{"en":"contraindication","fr":"contre-indication","def":"a reason a treatment should not be used"}]'::jsonb,
  'advanced'
),
(
  'critical-care-medicine', '🫀', 'Intensive Care',
  'Critical Care Medicine', 'Médecine de Soins Intensifs',
  'High-stakes English for the ICU: resuscitation, ventilation and monitoring.',
  'Anglais des situations critiques en réanimation : réanimation, ventilation et monitorage.',
  'Critical care medicine demands fast, unambiguous English. Teams communicate through structured handovers ("the patient is intubated and ventilated, on noradrenaline at 0.2 micrograms per kilo per minute") and use scoring systems such as the Glasgow Coma Scale and SOFA score. Key competencies include describing haemodynamic instability, ventilator settings ("we increased the PEEP and FiO2"), and escalation of care. Clear closed-loop communication during resuscitation can be life-saving.',
  '[{"en":"mechanical ventilation","fr":"ventilation mécanique","def":"assisted breathing via a ventilator"},{"en":"sepsis","fr":"sepsis","def":"life-threatening organ dysfunction from infection"},{"en":"vasopressor","fr":"vasopresseur","def":"drug that raises blood pressure by vasoconstriction"}]'::jsonb,
  'expert'
),
(
  'respiratory-medicine', '🫁', 'Pulmonology',
  'Respiratory Medicine', 'Médecine Respiratoire',
  'Describing respiratory symptoms, investigations and chronic disease.',
  'Décrire les symptômes respiratoires, les examens et les maladies chroniques.',
  'Respiratory medicine English centres on the accurate description of breathlessness ("dyspnoea on exertion"), cough and sputum. You will report investigations such as spirometry and arterial blood gases ("the ABG showed a respiratory acidosis"), and manage conditions like asthma, COPD and pneumonia. Phrases such as "auscultation revealed bilateral crackles" and "oxygen saturation on room air" are part of everyday clinical communication.',
  '[{"en":"dyspnoea","fr":"dyspnée","def":"difficult or laboured breathing"},{"en":"wheeze","fr":"sibilance","def":"a high-pitched whistling sound on breathing"},{"en":"spirometry","fr":"spirométrie","def":"test measuring lung volumes and airflow"}]'::jsonb,
  'advanced'
),
(
  'infectious-diseases', '🦠', 'Infectious Disease',
  'Infectious Diseases', 'Maladies Infectieuses',
  'English for pathogens, antimicrobial therapy and outbreak communication.',
  'Anglais des agents pathogènes, de l''antibiothérapie et de la communication des épidémies.',
  'Infectious disease English involves describing pathogens, transmission ("transmitted via respiratory droplets"), and the principles of antimicrobial stewardship. You should be able to discuss empirical versus targeted therapy, sensitivity testing ("the isolate was sensitive to ceftriaxone"), and infection control measures. This vocabulary is increasingly vital for reading global health literature and participating in international research.',
  '[{"en":"antimicrobial resistance","fr":"résistance aux antimicrobiens","def":"microbes surviving drugs designed to kill them"},{"en":"incubation period","fr":"période d''incubation","def":"time between exposure and symptom onset"},{"en":"empirical therapy","fr":"traitement empirique","def":"treatment started before the pathogen is confirmed"}]'::jsonb,
  'advanced'
),
(
  'medical-research-english', '🔬', 'Academic',
  'Medical Research English', 'Anglais de la Recherche Médicale',
  'Reading and writing scientific papers, abstracts and statistics.',
  'Lire et rédiger des articles scientifiques, des résumés et des statistiques.',
  'Academic medical English is the gateway to international publishing. You will learn the structure of a paper (IMRaD: Introduction, Methods, Results and Discussion), how to write a structured abstract, and the language of statistics ("the difference was statistically significant, p < 0.05"). Critical appraisal phrases such as "the study was limited by a small sample size" and "these findings should be interpreted with caution" allow you to engage with evidence-based medicine.',
  '[{"en":"randomised controlled trial","fr":"essai contrôlé randomisé","def":"study design reducing bias by random allocation"},{"en":"confounding factor","fr":"facteur de confusion","def":"a variable distorting the apparent association"},{"en":"peer review","fr":"évaluation par les pairs","def":"expert evaluation before publication"}]'::jsonb,
  'expert'
)
ON CONFLICT (slug) DO NOTHING;
