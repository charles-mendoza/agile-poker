'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Room } from '@/lib/types'
import { CARD_SETS } from '@/lib/cards'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Trash2, PlusCircle, Loader2 } from 'lucide-react'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useTransition } from 'react'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  name: z.string().min(1, 'Game name is required.'),
  description: z.string().optional(),
  cardSet: z.enum(
    Object.keys(CARD_SETS) as [keyof typeof CARD_SETS, ...(keyof typeof CARD_SETS)[]]
  ),
  revealMode: z.enum(['anonymous', 'transparent']),
  stories: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1, 'Story title is required.'),
        description: z.string().optional(),
      })
    )
    .min(1, 'At least one story is required.'),
})

type GameSetupFormValues = z.infer<typeof formSchema>

interface GameSetupProps {
  room: Room
}

export default function GameSetup({ room }: GameSetupProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const form = useForm<GameSetupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: room.name || '',
      description: room.description || '',
      cardSet: room.cardSet || 'scrum',
      revealMode: room.revealMode || 'transparent',
      stories: room.stories.map(s => ({ ...s, description: s.description || '' })) || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'stories',
  })

  const onSubmit = (data: GameSetupFormValues) => {
    startTransition(async () => {
      try {
        const roomRef = doc(db, 'rooms', room.id)
        const firstStoryId = data.stories[0]?.id || null
        await updateDoc(roomRef, {
          ...data,
          state: 'voting',
          currentStoryId: firstStoryId,
          stories: data.stories.map(s => ({ ...s, estimate: null })),
        })
        toast({ title: 'Game started!', description: 'Let the estimation begin.' })
      } catch (error) {
        console.error(error)
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to start the game.' })
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Setup</CardTitle>
        <CardDescription>
          Configure your Agile Poker session. Add stories and choose your card set.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Game Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cardSet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Set</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a card set" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.keys(CARD_SETS).map(set => (
                          <SelectItem key={set} value={set} className="capitalize">
                            {set}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="revealMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Anonymous Reveal</FormLabel>
                    <FormDescription>
                      Enable to hide individual player votes and only show the aggregate results.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === 'anonymous'}
                      onCheckedChange={checked =>
                        field.onChange(checked ? 'anonymous' : 'transparent')
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Stories</FormLabel>
              <FormDescription>Add the user stories you want to estimate.</FormDescription>
              <div className="space-y-4 mt-2">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4 bg-card-foreground/5">
                    <div className="flex items-start gap-4">
                      <div className="flex-grow space-y-2">
                        <FormField
                          control={form.control}
                          name={`stories.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Story Title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`stories.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Story Description (Optional)"
                                  {...field}
                                  rows={2}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove story</span>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => append({ id: crypto.randomUUID(), title: '', description: '' })}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Story
              </Button>
              {form.formState.errors.stories?.message && (
                <FormMessage>{form.formState.errors.stories?.message}</FormMessage>
              )}
              {form.formState.errors.stories?.root?.message && (
                <FormMessage>{form.formState.errors.stories?.root?.message}</FormMessage>
              )}
            </div>

            <Button type="submit" disabled={isPending} size="lg">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Game
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
