'use server'

/**
 * @fileOverview Explains significant discrepancies in story estimates using generative AI.
 *
 * - explainEstimateDiscrepancy - A function that uses generative AI to explain significant discrepancies in story estimates.
 * - ExplainEstimateDiscrepancyInput - The input type for the explainEstimateDiscrepancy function.
 * - ExplainEstimateDiscrepancyOutput - The return type for the explainEstimateDiscrepancy function.
 */

import { ai } from '@/ai/genkit'
import { z } from 'genkit'

const ExplainEstimateDiscrepancyInputSchema = z.object({
  estimates: z
    .array(z.number())
    .describe('An array of numerical estimates provided by team members.'),
  storyDescription: z.string().describe('A description of the story being estimated.'),
  context: z
    .string()
    .optional()
    .describe(
      'Additional context or information provided by the moderator to help explain the discrepancy.'
    ),
})
export type ExplainEstimateDiscrepancyInput = z.infer<typeof ExplainEstimateDiscrepancyInputSchema>

const ExplainEstimateDiscrepancyOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      'A non-judgmental explanation of the discrepancy between the estimates, incorporating the provided context.'
    ),
})
export type ExplainEstimateDiscrepancyOutput = z.infer<
  typeof ExplainEstimateDiscrepancyOutputSchema
>

export async function explainEstimateDiscrepancy(
  input: ExplainEstimateDiscrepancyInput
): Promise<ExplainEstimateDiscrepancyOutput> {
  return explainEstimateDiscrepancyFlow(input)
}

const prompt = ai.definePrompt({
  name: 'explainEstimateDiscrepancyPrompt',
  input: { schema: ExplainEstimateDiscrepancyInputSchema },
  output: { schema: ExplainEstimateDiscrepancyOutputSchema },
  prompt: `You are a helpful assistant that explains estimate discrepancies in story points during agile poker.

  You are provided with a set of estimates: {{{estimates}}}.
  The story being estimated is: {{{storyDescription}}}.
  The moderator has provided the following context: {{{context}}}

  Explain the discrepancy in a non-judgemental way, incorporating the context provided by the moderator to facilitate understanding and alignment among team members. Focus on providing insights into why estimates might differ based on the story description and context. Do not assign blame or make assumptions about individual team members' reasoning. The response must be a single paragraph.
  `,
})

const explainEstimateDiscrepancyFlow = ai.defineFlow(
  {
    name: 'explainEstimateDiscrepancyFlow',
    inputSchema: ExplainEstimateDiscrepancyInputSchema,
    outputSchema: ExplainEstimateDiscrepancyOutputSchema,
  },
  async input => {
    const { output } = await prompt(input)
    return output!
  }
)
