'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { createRoom } from '@/lib/actions'
import { useToast } from '@/hooks/use-toast'

export function CreateRoomForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleCreateRoom = async () => {
    const roomId = crypto.randomUUID().split('-')[0]

    startTransition(async () => {
      const result = await createRoom(roomId)
      if (result.success) {
        router.push(`/${roomId}`)
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        })
      }
    })
  }

  return (
    <Button onClick={handleCreateRoom} disabled={isPending} className="w-full text-lg py-6">
      {isPending ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : 'Create New Room'}
    </Button>
  )
}
