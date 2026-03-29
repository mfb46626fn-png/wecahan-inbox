'use client'

import { useState } from 'react'
import { 
  User, 
  Phone, 
  Calendar, 
  Tag, 
  StickyNote, 
  ShieldCheck, 
  Bot, 
  UserPlus, 
  MoreVertical,
  Trash2,
  CheckCircle,
  Clock,
  Archive
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { type Conversation } from '@/hooks/useConversations'
import { createClient } from '@/lib/supabase/client'

interface ConversationDetailsProps {
  conversation?: Conversation
}

export function ConversationDetails({ conversation }: ConversationDetailsProps) {
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  const toggleField = async (field: 'human_mode' | 'ai_enabled') => {
    if (!conversation || updating) return

    setUpdating(true)
    const { error } = await supabase
      .from('conversations')
      .update({ [field]: !conversation[field] })
      .eq('id', conversation.id)

    if (error) {
      console.error(`Error updating ${field}:`, error)
    }
    setUpdating(false)
  }

  const updateStatus = async (status: 'open' | 'pending' | 'closed') => {
    if (!conversation || updating) return

    setUpdating(true)
    const { error } = await supabase
      .from('conversations')
      .update({ status })
      .eq('id', conversation.id)

    if (error) {
      console.error('Error updating status:', error)
    }
    setUpdating(false)
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center border-l bg-card text-muted-foreground p-8 text-center text-sm italic">
        Select a conversation to view details
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col border-l bg-card overflow-y-auto w-80">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg tracking-tight">Details</h3>
          <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted border-2 border-primary/10 shadow-inner">
            <User className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <div>
            <h4 className="font-bold text-lg leading-tight">{conversation.profile_name || 'Unknown Contact'}</h4>
            <p className="text-sm text-muted-foreground font-mono flex items-center justify-center mt-1">
              <Phone className="h-3 w-3 mr-1.5" />
              {conversation.phone_number}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => updateStatus('open')}
            className={cn(
              "flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all",
              conversation.status === 'open' 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
                : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted"
            )}
          >
            <CheckCircle className="h-4 w-4 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Open</span>
          </button>
          <button 
            onClick={() => updateStatus('pending')}
            className={cn(
              "flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all",
              conversation.status === 'pending' 
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500" 
                : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted"
            )}
          >
            <Clock className="h-4 w-4 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending</span>
          </button>
          <button 
            onClick={() => updateStatus('closed')}
            className={cn(
              "flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all",
              conversation.status === 'closed' 
                ? "bg-muted border-muted-foreground/30 text-foreground" 
                : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted"
            )}
          >
            <Archive className="h-4 w-4 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Closed</span>
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 py-6 space-y-8">
        {/* Controls Section */}
        <div className="space-y-4">
          <h5 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Controls</h5>
          
          <div className="space-y-3">
            <button
              onClick={() => toggleField('human_mode')}
              disabled={updating}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl border p-4 transition-all text-left group",
                conversation.human_mode 
                  ? "bg-blue-500/5 border-blue-500/30 ring-1 ring-blue-500/10" 
                  : "bg-muted/20 border-transparent hover:border-muted-foreground/20"
              )}
            >
              <div className="flex items-center space-x-3">
                <ShieldCheck className={cn("h-5 w-5", conversation.human_mode ? "text-blue-500" : "text-muted-foreground")} />
                <div>
                  <p className="text-sm font-bold">Human Mode</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Disable AI autopiloting</p>
                </div>
              </div>
              <div className={cn(
                "h-5 w-10 rounded-full border p-0.5 transition-all relative",
                conversation.human_mode ? "bg-blue-500 border-blue-600" : "bg-muted border-muted-foreground/20"
              )}>
                <div className={cn(
                  "h-full aspect-square rounded-full bg-white shadow-sm transition-all",
                  conversation.human_mode ? "translate-x-5" : "translate-x-0"
                )} />
              </div>
            </button>

            <button
              onClick={() => toggleField('ai_enabled')}
              disabled={updating}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl border p-4 transition-all text-left group",
                conversation.ai_enabled 
                  ? "bg-violet-500/5 border-violet-500/30 ring-1 ring-violet-500/10" 
                  : "bg-muted/20 border-transparent hover:border-muted-foreground/20"
              )}
            >
              <div className="flex items-center space-x-3">
                <Bot className={cn("h-5 w-5", conversation.ai_enabled ? "text-violet-500" : "text-muted-foreground")} />
                <div>
                  <p className="text-sm font-bold">AI Enabled</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Allow automated responses</p>
                </div>
              </div>
              <div className={cn(
                "h-5 w-10 rounded-full border p-0.5 transition-all relative",
                conversation.ai_enabled ? "bg-violet-500 border-violet-600" : "bg-muted border-muted-foreground/20"
              )}>
                <div className={cn(
                  "h-full aspect-square rounded-full bg-white shadow-sm transition-all",
                  conversation.ai_enabled ? "translate-x-5" : "translate-x-0"
                )} />
              </div>
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-4 pt-4 border-t">
          <h5 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Properties</h5>
          
          <div className="space-y-4">
            <div className="flex items-center text-sm group">
              <UserPlus className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Assigned To</p>
                <button className="font-medium hover:underline decoration-dotted underline-offset-4">
                  {conversation.assigned_to || 'Unassigned'}
                </button>
              </div>
            </div>

            <div className="flex items-center text-sm group">
              <Calendar className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Created At</p>
                <p className="font-medium">{formatDate(conversation.created_at)}</p>
              </div>
            </div>

            <div className="flex items-start text-sm group">
              <Tag className="h-4 w-4 mr-3 mt-1 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-muted border text-[10px] font-bold">Inquiry</span>
                  <button className="px-2 py-0.5 rounded-full border border-dashed text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition-all">+ Add Tag</button>
                </div>
              </div>
            </div>

            <div className="flex items-start text-sm group">
              <StickyNote className="h-4 w-4 mr-3 mt-1 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Internal Notes</p>
                <button className="w-full text-left p-3 rounded-xl bg-muted/30 border border-transparent hover:border-muted-foreground/20 text-[11px] text-muted-foreground italic leading-relaxed transition-all">
                  {conversation.notes || 'No private notes yet. Click to add...'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t mt-auto">
        <button className="flex w-full items-center justify-center space-x-2 rounded-xl border-2 border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-bold text-destructive transition-all hover:bg-destructive hover:text-destructive-foreground hover:border-destructive">
          <Trash2 className="h-4 w-4" />
          <span>Permanently Delete Chat</span>
        </button>
      </div>
    </div>
  )
}
