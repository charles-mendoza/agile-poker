import Link from 'next/link'
import Image from 'next/image'
import logo from '@/assets/images/logo.png'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="ml-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src={logo} alt="Club" width={20} priority />
            <span className="font-bold">Agile Poker</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
