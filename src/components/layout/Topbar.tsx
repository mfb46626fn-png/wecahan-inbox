'use client'

import { Search, Bell, User, Menu, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface TopbarProps {
  onMenuClick?: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email || null)
    }
    getUser()
  }, [supabase.auth])

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card/50 backdrop-blur-md px-4 md:px-8 shrink-0 relative z-30">
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Trigger */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground active:scale-90"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search everything..."
            className="h-10 w-64 lg:w-96 rounded-full border bg-muted/50 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4">
        <button className="relative p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
          </span>
        </button>

        <div className="flex items-center space-x-3 pl-2 border-l">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none">{userEmail?.split('@')[0] || 'User'}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Administrator</p>
          </div>
          <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-primary/20 bg-muted flex items-center justify-center p-0.5 shadow-sm">
             <div className="h-full w-full rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
               <User className="h-5 w-5 text-primary" />
             </div>
          </div>
          
          <button 
            onClick={handleLogout}
            title="Çıkış Yap"
            className="ml-2 flex items-center justify-center p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95 shadow-sm border border-red-500/20"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
