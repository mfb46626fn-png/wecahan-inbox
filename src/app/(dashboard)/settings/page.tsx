'use client'

import { 
  Building, 
  Settings, 
  MessageCircle, 
  Info,
  ChevronRight,
  ShieldCheck,
  Bot
} from 'lucide-react'
import { cn } from '@/lib/utils'

const settingsSections = [
  {
    title: 'Workspace',
    description: 'Manage your organization profile and general settings.',
    icon: Building,
    items: ['Organization Details', 'Branding', 'Language & Timezone']
  },
  {
    title: 'WhatsApp Connection',
    description: 'Configure Cloud API credentials and webhooks.',
    icon: MessageCircle,
    iconColor: 'text-emerald-500',
    items: ['Phone Number ID', 'Access Token', 'Webhook URL']
  },
  {
    title: 'Automation & AI',
    description: 'Control n8n integration behavior and AI model parameters.',
    icon: Bot,
    iconColor: 'text-violet-500',
    items: ['AI Mode Rules', 'n8n Webhook Secret', 'Auto-Reply Filters']
  },
  {
    title: 'Security',
    description: 'Access logs, audit trails and security monitoring.',
    icon: ShieldCheck,
    iconColor: 'text-primary',
    items: ['Login History', 'Data Sovereignty', 'Encryption Keys']
  }
]

export default function SettingsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 py-10 px-6">
      <div className="flex flex-col space-y-3 mb-12">
        <h1 className="text-4xl font-black tracking-tight flex items-center">
          <Settings className="h-8 w-8 mr-4 text-muted-foreground" />
          Settings
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Everything you need to configure your WeCaHan Inbox dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {settingsSections.map((section, idx) => (
          <div 
            key={idx} 
            className="group relative rounded-3xl border bg-card p-8 transition-all hover:bg-muted/10 hover:shadow-2xl hover:shadow-black/20 hover:border-primary/20"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={cn(
                  "h-14 w-14 rounded-2xl bg-muted/20 border flex items-center justify-center transition-all group-hover:scale-110",
                  section.iconColor || "text-foreground"
                )}>
                  <section.icon className={cn("h-7 w-7", section.iconColor || "text-foreground")} />
                </div>
                <div>
                  <h3 className="text-xl font-black">{section.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs leading-relaxed">{section.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-8">
              {section.items.map((item, i) => (
                <button 
                  key={i} 
                  className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-muted/30 transition-all group/item border border-transparent hover:border-muted-foreground/10"
                >
                  <span className="text-sm font-bold text-muted-foreground group-hover/item:text-foreground transition-all">{item}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
            
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <section.icon className="h-24 w-24" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center pt-16 mt-16 border-t border-muted/20">
        <div className="max-w-2xl text-center space-y-6">
          <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary animate-pulse">
            <Info className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">System Status: Operational</span>
          </div>
          <p className="text-xs text-muted-foreground italic max-w-sm mx-auto opacity-60">
            Note: Most settings are currently read-only as this is an internal production preview.
            Changes must be requested via administrative channels.
          </p>
        </div>
      </div>
    </div>
  )
}
