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
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const menuItems = [
  { icon: Inbox, label: 'Inbox', href: '/inbox' },
  { icon: Calendar, label: 'Appointments', href: '/appointments' },
  { icon: Users, label: 'Team', href: '/team' },
  { icon: MessageSquareQuote, label: 'Quick Replies', href: '/quick-replies' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

interface AppSidebarProps {
  onClose?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function AppSidebar({ onClose, isCollapsed, onToggleCollapse }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-full w-full flex-col bg-card font-sans shadow-2xl lg:shadow-none transition-all duration-300">
      <div className={cn(
        "flex h-16 items-center border-b transition-all duration-300",
        isCollapsed ? "justify-center px-0" : "justify-between px-6"
      )}>
        {!isCollapsed && <h1 className="text-xl font-extrabold tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">WeCaHan</h1>}
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground mr-2"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Desktop Collapse Toggle */}
        {onToggleCollapse && (
          <button 
            onClick={onToggleCollapse}
            className={cn(
              "hidden lg:flex p-2 rounded-xl hover:bg-muted transition-all text-muted-foreground",
              isCollapsed && "mx-auto"
            )}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        )}
      </div>
      
      <nav className="flex-1 space-y-2 px-4 py-8 font-sans">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "group flex items-center rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                isCollapsed ? "justify-center h-12 w-12 mx-auto" : "px-4 py-3 text-sm font-bold"
              )}
            >
              <item.icon className={cn("transition-colors", isCollapsed ? "h-6 w-6" : "mr-3 h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              
              {!isCollapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {isActive && <ChevronRight className="ml-auto h-4 w-4 animate-in fade-in slide-in-from-left-2" />}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      <div className={cn(
        "border-t bg-muted/5 transition-all duration-300",
        isCollapsed ? "p-3 py-6" : "p-6"
      )}>
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={cn(
            "flex items-center justify-center rounded-2xl bg-destructive/10 text-destructive transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground active:scale-95 shadow-sm",
            isCollapsed ? "h-12 w-12 mx-auto" : "w-full px-4 py-3 text-sm font-bold"
          )}
        >
          <LogOut className={cn("transition-all", isCollapsed ? "h-6 w-6" : "mr-3 h-5 w-5")} />
          {!isCollapsed && <span>Logout</span>}
        </button>
        
        {!isCollapsed && (
          <div className="mt-4 flex flex-col items-center opacity-40">
            <p className="text-[9px] font-mono uppercase tracking-[0.3em]">v1.2.0-prod</p>
          </div>
        )}
      </div>
    </div>
  )
}
