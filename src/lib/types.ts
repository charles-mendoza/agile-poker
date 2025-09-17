export type CardSet = 'scrum' | 'fibonacci' | 'sequential' | 'hourly' | 'days' | 't-shirt'
export type RevealMode = 'anonymous' | 'transparent'

export interface Story {
  id: string
  title: string
  description: string
  estimate: string | number | null
}

export interface Player {
  id: string
  name: string
  isModerator: boolean
  vote: string | number | null
  voted: boolean
}

export type GameState = 'setup' | 'voting' | 'results'

export interface Room {
  id: string
  name: string
  description: string
  cardSet: CardSet
  revealMode: RevealMode
  stories: Story[]
  players: { [key: string]: Player }
  currentStoryId: string | null
  state: GameState
  createdAt: any
}
