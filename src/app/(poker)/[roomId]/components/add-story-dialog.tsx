'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PlusCircle, Loader2 } from 'lucide-react'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  title: z.string().min(1, 'Story title is required.'),
  description: z.string().optional(),
})

type AddStoryFormValues = z.infer<typeof formSchema>

interface AddStoryDialogProps {
  roomId: string
}

export default function AddStoryDialog({ roomId }: AddStoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const form = useForm<AddStoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const onSubmit = (data: AddStoryFormValues) => {
    startTransition(async () => {
      try {
        const roomRef = doc(db, 'rooms', roomId)
        const newStory = {
          id: crypto.randomUUID(),
          title: data.title,
          description: data.description || '',
          estimate: null,
        }
        await updateDoc(roomRef, {
          stories: arrayUnion(newStory),
        })
        toast({ title: 'Story Added', description: `"${data.title}" has been added to the game.` })
        form.reset()
        setOpen(false)
      } catch (error) {
        console.error(error)
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to add the story.' })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Story
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add a New Story</DialogTitle>
              <DialogDescription>
                Add a new story to the current game. It will become available for estimation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Story
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
