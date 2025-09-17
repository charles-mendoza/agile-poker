import { CreateRoomForm } from '@/components/home/create-room-form'
import { JoinRoomForm } from '@/components/home/join-room-form'
import { Separator } from '@/components/ui/separator'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-2">Agile Poker</h1>
          <p className="text-muted-foreground text-lg">
            Real-time story point estimation for agile teams.
          </p>
        </div>

        <div className="bg-card p-8 rounded-lg shadow-lg">
          <CreateRoomForm />
          <div className="my-6 flex items-center">
            <Separator className="flex-1" />
            <span className="mx-4 text-xs uppercase text-muted-foreground">Or</span>
            <Separator className="flex-1" />
          </div>
          <JoinRoomForm />
        </div>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Create a room and share the link to get started.</p>
          <br />
          <sub>
            Developed by <a href="https://github.com/charles-mendoza">Charles Mendoza</a>
          </sub>
        </div>
      </div>
    </main>
  )
}
