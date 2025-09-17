'use client'

import { useState, useTransition } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  explainEstimateDiscrepancy,
  ExplainEstimateDiscrepancyInput,
  ExplainEstimateDiscrepancyOutput,
} from '@/ai/flows/estimate-discrepancy-explanation'
import { Loader2, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AiExplanationDialogProps {
  estimates: number[]
  storyDescription: string
}

export default function AiExplanationDialog({
  estimates,
  storyDescription,
}: AiExplanationDialogProps) {
  const [context, setContext] = useState('')
  const [explanation, setExplanation] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleGetExplanation = async () => {
    const input: ExplainEstimateDiscrepancyInput = {
      estimates,
      storyDescription,
      context,
    }

    startTransition(async () => {
      try {
        setExplanation(null)
        const result: ExplainEstimateDiscrepancyOutput = await explainEstimateDiscrepancy(input)
        setExplanation(result.explanation)
      } catch (error) {
        console.error('AI explanation error:', error)
        toast({
          variant: 'destructive',
          title: 'AI Error',
          description: 'Could not generate an explanation.',
        })
      }
    })
  }

  return (
    <Dialog
      onOpenChange={() => {
        setExplanation(null)
        setContext('')
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Sparkles className="mr-2 h-4 w-4" /> Get AI Explanation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>AI-Powered Discrepancy Explanation</DialogTitle>
          <DialogDescription>
            Provide any additional context to help the AI understand potential reasons for the
            different estimates.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="context">Moderator Context (Optional)</Label>
            <Textarea
              id="context"
              placeholder="e.g., 'Some team members might be thinking about the recent API changes, while others might not be aware.'"
              value={context}
              onChange={e => setContext(e.target.value)}
            />
          </div>

          {isPending && (
            <div className="flex items-center justify-center p-8 rounded-lg bg-muted min-h-[100px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {explanation && (
            <div className="p-4 rounded-lg bg-muted">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Generated Explanation
              </h3>
              <p className="text-sm text-muted-foreground">{explanation}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleGetExplanation} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {explanation ? 'Regenerate' : 'Generate Explanation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
