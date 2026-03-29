'use client'

import { useState, useEffect } from 'react'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Topbar } from '@/components/layout/Topbar'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar_collapsed')
    if (saved === 'true') setIsCollapsed(true)
  }, [])

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const newState = !prev
      localStorage.setItem('sidebar_collapsed', String(newState))
      return newState
    })
  }

  // Close sidebar on navigation on mobile
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen bg-background overflow-hidden relative font-sans tracking-tight">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 bg-card border-r shadow-2xl lg:shadow-none",
        sidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
        !sidebarOpen && (isCollapsed ? "lg:w-20" : "lg:w-64")
      )}>
        <AppSidebar 
          onClose={() => setSidebarOpen(false)} 
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 h-full relative">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
          <div className="mx-auto max-w-[1600px] h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
