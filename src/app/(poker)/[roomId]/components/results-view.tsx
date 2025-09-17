'use client'

import { Room, Player } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ModeratorControls from './moderator-controls'
import AiExplanationDialog from './ai-explanation-dialog'
import { useState, useTransition } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ResultsViewProps {
  room: Room
  player: Player
}

export default function ResultsView({ room, player }: ResultsViewProps) {
  const currentStory = room.stories.find(s => s.id === room.currentStoryId)
  const votes = Object.values(room.players)
    .map(p => p.vote)
    .filter(v => v !== null && v !== undefined)
  const playersWithVotes = Object.values(room.players).filter(
    p => p.vote !== null && p.vote !== undefined
  )

  const [finalEstimate, setFinalEstimate] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  if (!currentStory) {
    if (player.isModerator) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>No story selected</CardTitle>
            <CardDescription>
              All stories have been estimated. You can add more stories or end the session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ModeratorControls room={room} />
          </CardContent>
        </Card>
      )
    }
    return (
      <Card>
        <CardHeader>
          <CardTitle>Waiting for the next round...</CardTitle>
          <CardDescription>
            All stories have been estimated. The moderator can add more.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const voteCounts = votes.reduce(
    (acc, vote) => {
      const key = String(vote)
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const numericVotes = votes.map(v => Number(v)).filter(v => !isNaN(v))
  const average =
    numericVotes.length > 0
      ? (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(1)
      : 'N/A'

  const hasDiscrepancy =
    numericVotes.length > 1 && Math.max(...numericVotes) - Math.min(...numericVotes) > 5

  const handleAcceptEstimate = () => {
    if (!finalEstimate) return
    startTransition(async () => {
      try {
        const roomRef = doc(db, 'rooms', room.id)
        const storyIndex = room.stories.findIndex(s => s.id === currentStory.id)

        if (storyIndex === -1) throw new Error('Could not find story to update.')

        const updatedStories = [...room.stories]
        updatedStories[storyIndex] = { ...updatedStories[storyIndex], estimate: finalEstimate }

        const nextUnestimatedStory = updatedStories.find(s => s.estimate === null)

        const playerUpdates: { [key: string]: any } = {}
        Object.keys(room.players).forEach(playerId => {
          playerUpdates[`players.${playerId}.vote`] = null
          playerUpdates[`players.${playerId}.voted`] = false
        })

        await updateDoc(roomRef, {
          stories: updatedStories,
          ...playerUpdates,
          state: 'voting',
          currentStoryId: nextUnestimatedStory ? nextUnestimatedStory.id : null,
        })

        toast({
          title: 'Estimate saved!',
          description: `Story "${currentStory.title}" set to ${finalEstimate}.`,
        })
        setFinalEstimate('')
      } catch (error) {
        console.error(error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save the estimate.',
        })
      }
    })
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Results for: {currentStory.title}</CardTitle>
          {currentStory.description && (
            <CardDescription className="text-md pt-2 whitespace-pre-wrap">
              {currentStory.description}
            </CardDescription>
          )}
        </CardHeader>
        <>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {room.revealMode === 'anonymous' &&
              Object.entries(voteCounts)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([vote, count]) => (
                  <div key={vote} className="bg-card-foreground/5 p-4 rounded-lg text-center">
                    <p className="text-4xl font-bold">{vote}</p>
                    <p className="text-sm text-muted-foreground">
                      {count} {count > 1 ? 'votes' : 'vote'}
                    </p>
                  </div>
                ))}
            {room.revealMode === 'transparent' &&
              playersWithVotes
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(p => (
                  <div key={p.id} className="flex flex-col items-center gap-2">
                    <div className="relative h-28 w-20 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all transform shadow-md bg-card border-primary">
                      {p.vote}
                    </div>
                    <div className="flex items-center gap-2 text-center">
                      <span className="font-medium text-sm truncate">{p.name}</span>
                    </div>
                  </div>
                ))}
          </CardContent>
          <CardContent>
            <div className="text-lg">
              Average:{' '}
              <Badge variant="secondary" className="text-lg">
                {average}
              </Badge>
            </div>
          </CardContent>
        </>
      </Card>

      {player.isModerator && currentStory.estimate === null && (
        <Card>
          <CardHeader>
            <CardTitle>Finalize Estimate</CardTitle>
            <CardDescription>
              Enter the agreed-upon estimate for this story. This will lock the estimate and
              automatically move to the next unestimated story.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Input
              value={finalEstimate}
              onChange={e => setFinalEstimate(e.target.value)}
              placeholder={`e.g. ${numericVotes[0] || '8'}`}
            />
            <Button
              onClick={handleAcceptEstimate}
              disabled={!finalEstimate || isPending}
              className="w-full sm:w-auto"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Accept & Next
            </Button>
          </CardContent>
        </Card>
      )}

      {hasDiscrepancy && player.isModerator && (
        <Card>
          <CardHeader>
            <CardTitle>Large Vote Discrepancy Detected</CardTitle>
            <CardDescription>
              Use AI to generate a non-judgemental explanation for the wide range of votes to
              facilitate discussion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AiExplanationDialog
              estimates={numericVotes}
              storyDescription={currentStory.description || currentStory.title}
            />
          </CardContent>
        </Card>
      )}

      {player.isModerator && <ModeratorControls room={room} />}
    </div>
  )
}
