import { useState, useEffect } from 'react'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Room, Player } from '@/lib/types'

export function useRoom(roomId: string, playerId: string | null, playerName: string | null) {
  const [room, setRoom] = useState<Room | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!roomId || !playerId || !playerName) {
      if (!roomId) setLoading(false)
      return
    }

    const roomRef = doc(db, 'rooms', roomId)

    const unsubscribe = onSnapshot(
      roomRef,
      async docSnap => {
        if (docSnap.exists()) {
          const roomData = { id: docSnap.id, ...docSnap.data() } as Room

          let currentPlayer = roomData.players?.[playerId]

          if (!currentPlayer) {
            const isFirstPlayer = !roomData.players || Object.keys(roomData.players).length === 0

            currentPlayer = {
              id: playerId,
              name: playerName,
              isModerator: isFirstPlayer,
              vote: null,
              voted: false,
            }

            await updateDoc(roomRef, {
              [`players.${playerId}`]: currentPlayer,
            })

            // We'll get the updated data in the next snapshot, so we can just set the local version for now
            roomData.players = { ...roomData.players, [playerId]: currentPlayer }
          }

          setRoom(roomData)
          setPlayer(roomData.players?.[playerId])
          setLoading(false)
        } else {
          // setError(new Error('Room not found'));
          // This is handled in room-client now to show a better UI
          setLoading(false)
        }
      },
      err => {
        console.error('Firebase snapshot error:', err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [roomId, playerId, playerName])

  return { room, player, loading, error }
}
