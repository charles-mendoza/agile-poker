'use client'

import { useParams } from 'next/navigation'
import RoomClient from './components/room-client'

export default function RoomPage() {
  const params = useParams()
  const roomId = Array.isArray(params.roomId) ? params.roomId[0] : params.roomId

  if (!roomId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading room...</p>
      </div>
    )
  }

  return <RoomClient roomId={roomId} />
}
