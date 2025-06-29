import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, Building2, Users, Home } from 'lucide-react'

export function PublicHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Brain className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Skills Radar</span>
            <span className="truncate text-xs text-muted-foreground">
              Techie Talent
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/teams" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Teams
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}