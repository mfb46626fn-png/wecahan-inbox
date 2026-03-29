'use client'

import { useState } from 'react'
import { MessageSquare, Search, Filter, Loader2, User } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { type Conversation } from '@/hooks/useConversations'

interface ConversationListProps {
  conversations: Conversation[]
  loading: boolean
  selectedId?: string
  onSelect: (id: string) => void
}

export function ConversationList({ 
  conversations, 
  loading, 
  selectedId, 
  onSelect 
}: ConversationListProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'pending'>('all')

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = 
      conv.phone_number.includes(search) || 
      (conv.profile_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (conv.last_message_preview?.toLowerCase() || '').includes(search.toLowerCase())
    
    const matchesFilter = filter === 'all' || conv.status === filter
    
    return matchesSearch && matchesFilter
  })

  return (
    <div className="flex h-full flex-col bg-card border-r">
      <div className="p-4 space-y-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border bg-muted/50 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex space-x-1 overflow-x-auto pb-1 no-scrollbar">
            {(['all', 'open', 'pending', 'closed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-full border transition-all whitespace-nowrap",
                  filter === f 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground underline decoration-dotted">No conversations found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  "w-full px-4 py-4 flex items-start text-left transition-all hover:bg-muted/40",
                  selectedId === conv.id && "bg-muted/60 border-l-4 border-primary"
                )}
              >
                <div className="relative mr-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted border">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-card">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold truncate leading-tight">
                      {conv.profile_name || conv.phone_number}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                      {formatDate(conv.last_message_at)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 break-all mb-2 leading-tight">
                    {conv.last_message_preview || "No messages yet"}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                      conv.status === 'open' ? "bg-emerald-500/10 text-emerald-500" :
                      conv.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {conv.status}
                    </span>
                    {conv.human_mode && (
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-medium uppercase tracking-wider">
                        Human
                      </span>
                    )}
                    {conv.ai_enabled && !conv.human_mode && (
                      <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-500 text-[10px] font-medium uppercase tracking-wider">
                        AI
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
