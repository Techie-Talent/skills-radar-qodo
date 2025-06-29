import Link from 'next/link'
import { Brain } from 'lucide-react'

export function PublicOnlyHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
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
      </div>
    </header>
  )
}