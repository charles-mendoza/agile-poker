'use client'

import { useEffect, useState } from 'react'
import { useRoom } from '@/hooks/use-room'
import NamePrompt from './name-prompt'
import GameSetup from './game-setup'
import VotingView from './voting-view'
import ResultsView from './results-view'
import PlayersList from './players-list'
import EstimatedStories from './estimated-stories'
import { Skeleton } from '@/components/ui/skeleton'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'

export default function RoomClient({ roomId }: { roomId: string }) {
  const [playerName, setPlayerName] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [roomExists, setRoomExists] = useState<boolean | null>(null)
  const [checkedAuth, setCheckedAuth] = useState(false)

  const { room, player, loading, error } = useRoom(roomId, playerId, playerName)

  useEffect(() => {
    const checkRoom = async () => {
      if (roomExists === null) {
        const roomRef = doc(db, 'rooms', roomId)
        const roomSnap = await getDoc(roomRef)
        setRoomExists(roomSnap.exists())
      }
    }
    checkRoom()
  }, [roomId, roomExists])

  useEffect(() => {
    const storedPlayerId = localStorage.getItem(`player_id_${roomId}`)
    const storedPlayerName = localStorage.getItem(`player_name_${roomId}`)

    if (storedPlayerId && storedPlayerName) {
      setPlayerId(storedPlayerId)
      setPlayerName(storedPlayerName)
    } else {
      const newPlayerId = crypto.randomUUID()
      setPlayerId(newPlayerId)
    }
    setCheckedAuth(true)
  }, [roomId])

  const handleNameSet = (name: string) => {
    if (playerId) {
      localStorage.setItem(`player_id_${roomId}`, playerId)
      localStorage.setItem(`player_name_${roomId}`, name)
      setPlayerName(name)
    }
  }

  if (!checkedAuth) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    )
  }

  if (!playerName) {
    return <NamePrompt onNameSet={handleNameSet} />
  }

  if (roomExists === null || (loading && roomExists !== false)) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    )
  }

  if (roomExists === false) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Room Not Found</AlertTitle>
        <AlertDescription>
          The room with ID "{roomId}" does not exist. Please check the ID or create a new room.
        </AlertDescription>
      </Alert>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>An Error Occurred</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    )
  }

  if (!room || !player) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Joining room...</p>
      </div>
    )
  }

  const isModerator = player.isModerator

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3 space-y-8">
        {room.state === 'setup' && isModerator && <GameSetup room={room} />}
        {room.state === 'setup' && !isModerator && (
          <div className="flex items-center justify-center h-full bg-card rounded-lg p-8 min-h-[50vh]">
            <p className="text-muted-foreground text-lg">
              Waiting for the moderator to set up the game...
            </p>
          </div>
        )}
        {room.state === 'voting' && <VotingView room={room} player={player} />}
        {room.state === 'results' && <ResultsView room={room} player={player} />}
      </div>
      <div className="lg:col-span-1 space-y-8">
        <PlayersList room={room} />
        <EstimatedStories room={room} />
      </div>
    </div>
  )
}
