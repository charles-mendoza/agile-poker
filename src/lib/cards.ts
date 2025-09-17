import type { CardSet } from './types'

export const CARD_SETS: Record<CardSet, (string | number)[]> = {
  scrum: [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, '?', '☕'],
  fibonacci: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?', '☕'],
  sequential: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '?', '☕'],
  hourly: [0, 1, 2, 4, 8, 12, 16, 24, 32, 40, '?', '☕'],
  days: [0, 0.5, 1, 2, 3, 5, 10, 15, 20, '?', '☕'],
  't-shirt': ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕'],
}
