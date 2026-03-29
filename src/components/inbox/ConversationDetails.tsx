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

  const handleDelete = async () => {
    if (!conversation || updating || !confirm('Are you sure you want to permanently delete this chat? This cannot be undone.')) return

    setUpdating(true)
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversation.id)

    if (error) {
      console.error('Error deleting conversation:', error)
      alert('Failed to delete conversation')
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
    <div className="flex h-full flex-col border-l bg-card overflow-y-auto">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg tracking-tight text-foreground">Details</h3>
          <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted border flex-shrink-0">
            <User className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <div className="min-w-0 w-full px-2">
            <h4 className="font-bold text-lg leading-tight truncate text-foreground">{conversation.profile_name || 'Unknown Contact'}</h4>
            <p className="text-sm text-muted-foreground font-mono flex items-center justify-center mt-1">
              <Phone className="h-3 w-3 mr-1.5" />
              {conversation.phone_number}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => updateStatus('open')}
            disabled={updating}
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
            disabled={updating}
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
            disabled={updating}
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
          <h5 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Automation</h5>
          
          <div className="space-y-3">
            <button
              onClick={() => toggleField('human_mode')}
              disabled={updating}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl border p-4 transition-all text-left group",
                conversation.human_mode 
                  ? "bg-blue-500/5 border-blue-500/40 ring-1 ring-blue-500/10 shadow-sm shadow-blue-500/5" 
                  : "bg-muted/20 border-transparent hover:border-muted-foreground/20 hover:bg-muted/30"
              )}
            >
              <div className="flex items-center space-x-3">
                <ShieldCheck className={cn("h-5 w-5", conversation.human_mode ? "text-blue-500" : "text-muted-foreground")} />
                <div>
                  <p className="text-sm font-bold text-foreground">Human Mode</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 font-sans">Disable AI autopiloting</p>
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
                  ? "bg-violet-500/5 border-violet-500/40 ring-1 ring-violet-500/10 shadow-sm shadow-violet-500/5" 
                  : "bg-muted/20 border-transparent hover:border-muted-foreground/20 hover:bg-muted/30"
              )}
            >
              <div className="flex items-center space-x-3">
                <Bot className={cn("h-5 w-5", conversation.ai_enabled ? "text-violet-500" : "text-muted-foreground")} />
                <div>
                  <p className="text-sm font-bold text-foreground">AI Enabled</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 font-sans">Allow automated responses</p>
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
          <h5 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Properties</h5>
          
          <div className="space-y-4">
            <div className="flex items-center text-sm group">
              <UserPlus className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5">Assigned To</p>
                <button className="font-medium hover:underline decoration-dotted underline-offset-4 text-foreground/80 font-sans">
                  {conversation.assigned_to || 'Unassigned'}
                </button>
              </div>
            </div>

            <div className="flex items-center text-sm group">
              <Calendar className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-0.5 font-mono">Created At</p>
                <p className="font-medium text-foreground/80 lowercase">{formatDate(conversation.created_at)}</p>
              </div>
            </div>

            <div className="flex items-start text-sm group">
              <Tag className="h-4 w-4 mr-3 mt-1 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-muted border text-[9px] font-bold tracking-tight uppercase">Inquiry</span>
                  <button className="px-2 py-0.5 rounded-md border border-dashed border-muted-foreground/30 text-[9px] text-muted-foreground hover:bg-muted hover:text-foreground transition-all">+ Add Tag</button>
                </div>
              </div>
            </div>

            <div className="flex items-start text-sm group">
              <StickyNote className="h-4 w-4 mr-3 mt-1 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1 text-foreground/60">Internal Notes</p>
                <button className="w-full text-left p-3 rounded-xl bg-muted/30 border border-transparent hover:border-muted-foreground/10 text-[11px] text-muted-foreground/80 italic leading-relaxed transition-all font-sans">
                  {conversation.notes || 'No private notes yet. Click to add...'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t mt-auto">
        <button 
          onClick={handleDelete}
          disabled={updating}
          className="flex w-full items-center justify-center space-x-2 rounded-xl border-2 border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-bold text-destructive transition-all hover:bg-destructive hover:text-destructive-foreground hover:border-destructive active:scale-95 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          <span>Permanently Delete Chat</span>
        </button>
      </div>
    </div>
  )
}
