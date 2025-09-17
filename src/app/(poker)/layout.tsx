import { Header } from '@/components/poker/header'

export default function PokerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">{children}</main>
    </div>
  )
}
