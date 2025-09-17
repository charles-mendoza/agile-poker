'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function JoinRoomForm() {
  const router = useRouter()
  const [roomId, setRoomId] = useState('')

  const handleJoinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (roomId.trim()) {
      router.push(`/${roomId.trim()}`)
    }
  }

  return (
    <form onSubmit={handleJoinRoom} className="flex flex-col gap-4">
      <Input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={e => setRoomId(e.target.value)}
        className="text-center text-lg"
        aria-label="Room ID"
      />
      <Button type="submit" variant="secondary" className="w-full text-lg py-6">
        Join Room
      </Button>
    </form>
  )
}
