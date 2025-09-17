import { Room } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Circle, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PlayersListProps {
  room: Room
}

export default function PlayersList({ room }: PlayersListProps) {
  const players = Object.values(room.players || {}).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Players</span>
          <Badge variant="secondary">{players.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {players.map(player => (
            <li key={player.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="font-medium">{player.name}</span>
                  {player.isModerator && (
                    <span className="text-xs text-yellow-500 flex items-center gap-1">
                      <Crown className="h-3 w-3" /> Moderator
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {room.state === 'voting' &&
                  (player.voted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  ))}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
