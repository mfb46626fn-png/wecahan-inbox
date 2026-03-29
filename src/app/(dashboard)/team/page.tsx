'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Shield, ShieldCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Profile = {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'agent'
  is_active: boolean
}

export default function TeamPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: true })

      if (error) {
        console.error('Error fetching profiles:', error)
      } else {
        setProfiles(data as Profile[])
      }
      setLoading(false)
    }

    fetchProfiles()
  }, [supabase])

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
        <p className="text-muted-foreground text-lg">Manage internal users and their access levels.</p>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20">
            <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20 py-20 text-center">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xl font-medium">No team members found</p>
            <p className="max-w-xs text-muted-foreground mt-2">Initialize your database to see members here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div 
                key={profile.id} 
                className={cn(
                  "relative group overflow-hidden rounded-2xl border bg-card p-6 transition-all hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30",
                  !profile.is_active && "opacity-60 grayscale"
                )}
              >
                <div className="absolute top-0 right-0 p-4">
                  {profile.role === 'admin' ? (
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <Shield className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted border-2 group-hover:border-primary/20 transition-colors">
                    <User className="h-8 w-8 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{profile.full_name || 'Anonymous User'}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-80">{profile.role}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-muted-foreground/10">
                  <div className="flex items-center text-sm text-muted-foreground font-medium group/line">
                    <Mail className="h-4 w-4 mr-3 text-muted-foreground/40 group-hover/line:text-primary/60 transition-colors" />
                    <span className="truncate group-hover/line:text-foreground transition-colors">{profile.email}</span>
                  </div>
                  
                  <div className="flex items-center mt-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      profile.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                    )}>
                      {profile.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center pt-12">
        <div className="rounded-2xl bg-card border px-6 py-4 flex items-center space-x-4 max-w-md shadow-lg shadow-black/20">
          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Role Access</p>
            <p className="text-xs text-muted-foreground">Only admins can manage roles and permissions.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
