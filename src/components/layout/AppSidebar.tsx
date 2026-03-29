'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Inbox, 
  Users, 
  MessageSquareQuote, 
  Settings, 
  LogOut,
  ChevronRight,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const menuItems = [
  { icon: Inbox, label: 'Inbox', href: '/inbox' },
  { icon: Users, label: 'Team', href: '/team' },
  { icon: MessageSquareQuote, label: 'Quick Replies', href: '/quick-replies' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

interface AppSidebarProps {
  onClose?: () => void
}

export function AppSidebar({ onClose }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-full w-full flex-col bg-card text-card-foreground shadow-2xl lg:shadow-none">
      <div className="flex h-16 items-center justify-between border-b px-6">
        <h1 className="text-xl font-extrabold tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">WeCaHan Inbox</h1>
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden p-2 -mr-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto font-sans">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5 transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              {item.label}
              {isActive && <ChevronRight className="ml-auto h-4 w-4 animate-in fade-in slide-in-from-left-2" />}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-6 bg-muted/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center rounded-xl bg-destructive/10 px-4 py-3 text-sm font-bold text-destructive transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground active:scale-95 shadow-sm"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
        <p className="mt-4 text-center text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em] opacity-40">v1.2.0-prod</p>
      </div>
    </div>
  )
}
