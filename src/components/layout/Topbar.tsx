'use client'

import { usePathname } from 'next/navigation'
import { User, Bell, Search } from 'lucide-react'

export function Topbar() {
  const pathname = usePathname()
  const title = pathname.split('/').pop()?.replace(/-/g, ' ') || 'Inbox'

  return (
    <header className="flex h-16 items-center border-b bg-card-foreground/5 dark:bg-card px-8 backdrop-blur-md">
      <div className="flex flex-1 items-center">
        <h2 className="text-lg font-semibold capitalize">{title}</h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search placeholder */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-md border bg-muted/50 pl-9 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-destructive"></span>
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <User className="h-5 w-5" />
        </div>
      </div>
    </header>
  )
}
