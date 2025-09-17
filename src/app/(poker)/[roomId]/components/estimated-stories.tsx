import { Room } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface EstimatedStoriesProps {
  room: Room
}

export default function EstimatedStories({ room }: EstimatedStoriesProps) {
  const estimatedStories = room.stories.filter(s => s.estimate !== null)
  const total = estimatedStories.reduce(
    (sum, s) => sum + parseInt(s.estimate?.toString() || '0'),
    0
  )

  if (estimatedStories.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Estimated Stories</span>
          <Badge variant="secondary">{total}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <ul className="space-y-3">
            {estimatedStories.map(story => (
              <li key={story.id} className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium truncate flex-1 w-48" title={story.title}>
                  {story.title}
                </span>
                <Badge variant="outline">{story.estimate}</Badge>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
