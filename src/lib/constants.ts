export const ALGERIAN_UNIVERSITIES = [
  "Université de Djelfa (Ziane Achour)",
  "Université d'Alger 1 (Ben Youcef Benkhedda)",
  "Université Constantine 3 (Salah Boubnider)",
  "Université d'Oran 1 (Ahmed Ben Bella)",
  "Université de Tlemcen",
  "Université Abou Bekr Belkaid (Tlemcen)",
  "Université Ferhat Abbas (Sétif 1)",
  "Université Badji Mokhtar (Annaba)",
  "Université de Béjaïa",
  "Université de Batna",
  "Université Djillali Liabes (Sidi Bel Abbès)",
  "Université de Blida",
  "Université de Biskra",
  "Université de Tiaret",
  "Université de Mostaganem",
  "Autre",
]

export const SPECIALTIES = [
  { value: "Medicine", label: "Médecine", emoji: "🩺" },
  { value: "Dentistry", label: "Médecine Dentaire", emoji: "🦷" },
  { value: "Pharmacy", label: "Pharmacie", emoji: "💊" },
]

export const STUDY_YEARS = [1, 2, 3, 4, 5, 6, 7]

export const BODY_SYSTEMS = [
  { slug: "anatomy",        fr: "Anatomie",         en: "Anatomy",         year: 1, emoji: "🦴" },
  { slug: "histology",      fr: "Histologie",       en: "Histology",       year: 1, emoji: "🔬" },
  { slug: "embryology",     fr: "Embryologie",      en: "Embryology",      year: 1, emoji: "🧬" },
  { slug: "biochemistry",   fr: "Biochimie",        en: "Biochemistry",    year: 1, emoji: "⚗️" },
  { slug: "physiology",     fr: "Physiologie",      en: "Physiology",      year: 1, emoji: "💓" },
  { slug: "cardiovascular", fr: "Cardiovasculaire", en: "Cardiovascular",  year: 2, emoji: "❤️" },
  { slug: "digestive",      fr: "Digestif",         en: "Digestive",       year: 2, emoji: "🫁" },
  { slug: "urinary",        fr: "Urinaire",         en: "Urinary",         year: 2, emoji: "🫘" },
  { slug: "neurological",   fr: "Neurologique",     en: "Neurological",    year: 2, emoji: "🧠" },
  { slug: "endocrine",      fr: "Endocrinien",      en: "Endocrine",       year: 2, emoji: "🧪" },
  { slug: "pharmacology",   fr: "Pharmacologie",    en: "Pharmacology",    year: 3, emoji: "💊" },
  { slug: "pathology",      fr: "Pathologie",       en: "Pathology",       year: 3, emoji: "🦠" },
  { slug: "semiology",      fr: "Sémiologie",       en: "Semiology",       year: 3, emoji: "🩺" },
  { slug: "immunology",     fr: "Immunologie",      en: "Immunology",      year: 3, emoji: "🛡️" },
  { slug: "abbreviations",  fr: "Abréviations",     en: "Abbreviations",   year: null, emoji: "📋" },
  { slug: "word-roots",     fr: "Racines des Mots", en: "Word Roots",      year: null, emoji: "🔤" },
]

export const LEVEL_THRESHOLDS = [
  { level: 1,  label: "Étudiant",        xp: 0 },
  { level: 2,  label: "Apprenti",        xp: 200 },
  { level: 3,  label: "Stagiaire",       xp: 600 },
  { level: 4,  label: "Interne",         xp: 1400 },
  { level: 5,  label: "Résident",        xp: 3000 },
  { level: 6,  label: "Praticien",       xp: 6000 },
  { level: 7,  label: "Spécialiste",     xp: 12000 },
  { level: 8,  label: "Médecin",         xp: 25000 },
  { level: 9,  label: "Chef de Clinique",xp: 50000 },
  { level: 10, label: "Professeur",      xp: 100000 },
]

export function getLevelFromXP(xp: number) {
  let current = LEVEL_THRESHOLDS[0]
  for (const threshold of LEVEL_THRESHOLDS) {
    if (xp >= threshold.xp) current = threshold
    else break
  }
  return current
}
