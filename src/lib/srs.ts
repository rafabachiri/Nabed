export type Rating = 0 | 1 | 2  // 0=Don't know | 1=Almost | 2=Know it

export interface SRSResult {
  srsLevel: number
  easeFactor: number
  intervalDays: number
  nextReview: string  // ISO date string YYYY-MM-DD
}

export function calculateNextReview(
  srsLevel: number,
  easeFactor: number,
  rating: Rating
): SRSResult {
  let newSrsLevel: number
  let newEaseFactor: number
  let intervalDays: number

  if (rating === 0) {
    newSrsLevel = 0
    newEaseFactor = easeFactor
    intervalDays = 1
  } else {
    newEaseFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (2 - rating) * (0.08 + (2 - rating) * 0.02))
    )
    newSrsLevel = srsLevel + 1
    if (srsLevel === 0) intervalDays = 1
    else if (srsLevel === 1) intervalDays = 3
    else intervalDays = Math.round((srsLevel - 1) * newEaseFactor)
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + intervalDays)

  return {
    srsLevel: newSrsLevel,
    easeFactor: newEaseFactor,
    intervalDays,
    nextReview: nextReview.toISOString().split("T")[0],
  }
}

export function xpForRating(rating: Rating, difficulty: "easy" | "medium" | "hard"): number {
  if (rating === 0) return 0
  if (rating === 1) return 3
  return { easy: 5, medium: 10, hard: 15 }[difficulty]
}
