'use client'

import { useState, useTransition, useEffect } from 'react'
import { Room, Player } from '@/lib/types'
import { CARD_SETS } from '@/lib/cards'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ModeratorControls from './moderator-controls'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface VotingViewProps {
  room: Room
  player: Player
}

export default function VotingView({ room, player }: VotingViewProps) {
  const currentStory = room.stories.find(s => s.id === room.currentStoryId)
  const cardSet = CARD_SETS[room.cardSet]
  const [selectedVote, setSelectedVote] = useState<string | number | null>(player.vote)
  const [isSubmitting, startTransition] = useTransition()

  useEffect(() => {
    setSelectedVote(player.vote)
  }, [player.vote])

  const handleVote = (vote: string | number) => {
    setSelectedVote(vote)
    startTransition(async () => {
      const playerRef = doc(db, 'rooms', room.id)
      await updateDoc(playerRef, {
        [`players.${player.id}.vote`]: vote,
        [`players.${player.id}.voted`]: true,
      })
    })
  }

  const handleSkip = () => {
    setSelectedVote(null)
    startTransition(async () => {
      const playerRef = doc(db, 'rooms', room.id)
      await updateDoc(playerRef, {
        [`players.${player.id}.vote`]: null,
        [`players.${player.id}.voted`]: true,
      })
    })
  }

  if (!currentStory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No story selected</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The moderator needs to select a story to begin voting.
          </p>
          {player.isModerator && <ModeratorControls room={room} />}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{currentStory.title}</CardTitle>
          {currentStory.description && (
            <CardDescription className="text-md pt-2 whitespace-pre-wrap">
              {currentStory.description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Vote</CardTitle>
          <CardDescription>Select a card to cast your vote for the current story.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-4">
            {cardSet.map(cardValue => (
              <button
                key={String(cardValue)}
                onClick={() => handleVote(cardValue)}
                disabled={isSubmitting}
                className={cn(
                  'relative h-28 w-20 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all transform hover:scale-105 active:scale-100',
                  'shadow-md',
                  selectedVote === cardValue
                    ? 'border-primary bg-primary/20 -translate-y-2 shadow-lg shadow-primary/20'
                    : 'border-border bg-card hover:border-primary/50'
                )}
              >
                {cardValue}
              </button>
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <Button variant="ghost" onClick={handleSkip} disabled={isSubmitting}>
              Skip this vote
            </Button>
          </div>
        </CardContent>
      </Card>
      {player.isModerator && <ModeratorControls room={room} />}
    </div>
  )
}
