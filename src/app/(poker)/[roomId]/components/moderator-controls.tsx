'use client'

import { useTransition } from 'react'
import { Room } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Loader2 } from 'lucide-react'
import AddStoryDialog from './add-story-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface ModeratorControlsProps {
  room: Room
}

export default function ModeratorControls({ room }: ModeratorControlsProps) {
  const [isPending, startTransition] = useTransition()

  const handleReveal = () => {
    startTransition(async () => {
      const roomRef = doc(db, 'rooms', room.id)
      await updateDoc(roomRef, { state: 'results' })
    })
  }

  const handleReset = () => {
    startTransition(async () => {
      const roomRef = doc(db, 'rooms', room.id)
      const playerUpdates: { [key: string]: any } = {}
      Object.keys(room.players).forEach(playerId => {
        playerUpdates[`players.${playerId}.vote`] = null
        playerUpdates[`players.${playerId}.voted`] = false
      })
      await updateDoc(roomRef, { ...playerUpdates, state: 'voting' })
    })
  }

  const handleNextStory = (storyId: string) => {
    startTransition(async () => {
      const roomRef = doc(db, 'rooms', room.id)
      const playerUpdates: { [key: string]: any } = {}
      Object.keys(room.players).forEach(playerId => {
        playerUpdates[`players.${playerId}.vote`] = null
        playerUpdates[`players.${playerId}.voted`] = false
      })
      await updateDoc(roomRef, {
        ...playerUpdates,
        state: 'voting',
        currentStoryId: storyId,
      })
    })
  }

  const handleCancelGame = () => {
    startTransition(async () => {
      const roomRef = doc(db, 'rooms', room.id)

      const playerUpdates: { [key: string]: any } = {}
      Object.keys(room.players).forEach(playerId => {
        playerUpdates[`players.${playerId}.vote`] = null
        playerUpdates[`players.${playerId}.voted`] = false
      })

      await updateDoc(roomRef, {
        ...playerUpdates,
        state: 'voting',
        currentStoryId: null,
      })
    })
  }

  const handleRevealModeChange = (checked: boolean) => {
    startTransition(async () => {
      const roomRef = doc(db, 'rooms', room.id)
      await updateDoc(roomRef, { revealMode: checked ? 'anonymous' : 'transparent' })
    })
  }

  const unestimatedStories = room.stories.filter(
    s => s.estimate === null && s.id !== room.currentStoryId
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderator Controls</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {room.state === 'voting' && (
            <>
              <Button onClick={handleReveal} disabled={isPending || !room.currentStoryId}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reveal Cards
              </Button>
            </>
          )}
          {(room.state === 'results' || room.state === 'voting') && (
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={isPending || !room.currentStoryId}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Play Again
            </Button>
          )}
          {(room.state === 'results' || room.state === 'voting') &&
            unestimatedStories.length > 0 && (
              <Select onValueChange={handleNextStory} disabled={isPending}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Estimate another story" />
                </SelectTrigger>
                <SelectContent>
                  {unestimatedStories.map(story => (
                    <SelectItem key={story.id} value={story.id}>
                      {story.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          <AddStoryDialog roomId={room.id} />
          {(room.state === 'voting' || room.state === 'results') && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isPending || !room.currentStoryId}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cancel Round
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will end the current round and reset all votes. You can then select a new
                    story to estimate.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Back</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelGame}>
                    Yes, Cancel Round
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="reveal-mode-toggle"
            checked={room.revealMode === 'anonymous'}
            onCheckedChange={handleRevealModeChange}
            disabled={isPending}
          />
          <Label htmlFor="reveal-mode-toggle">Anonymous Reveal</Label>
        </div>
      </CardContent>
    </Card>
  )
}
