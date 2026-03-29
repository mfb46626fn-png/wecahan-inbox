'use client'

import { useEffect, useRef } from 'react'
import { Loader2, User, Bot, UserCheck, ShieldAlert } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { type Message } from '@/hooks/useMessages'

interface ConversationThreadProps {
  messages: Message[]
  loading: boolean
  conversationId?: string
}

export function ConversationThread({ messages, loading, conversationId }: ConversationThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (!conversationId) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/10">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted border animate-pulse">
          <User className="h-10 w-10 text-muted-foreground/30" />
        </div>
        <p className="text-lg font-medium">Select a conversation</p>
        <p className="max-w-xs text-sm">Choose a thread from the list on the left to start corresponding.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-muted/5 relative">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-3 opacity-50">
            <ShieldAlert className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Chat history is empty.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOutbound = msg.direction === 'outbound'
            const nextMsg = messages[index + 1]
            const isLastOfGroup = !nextMsg || nextMsg.direction !== msg.direction

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex flex-col max-w-[85%] transition-all",
                  isOutbound ? "ml-auto items-end" : "mr-auto items-start",
                  isLastOfGroup ? "mb-6" : "mb-1"
                )}
              >
                <div className="flex items-end space-x-2">
                  {!isOutbound && isLastOfGroup && (
                    <div className="mb-1 h-6 w-6 shrink-0 rounded-full bg-muted border flex items-center justify-center">
                      <User className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  {!isOutbound && !isLastOfGroup && <div className="h-6 w-6 shrink-0" />}

                  <div
                    className={cn(
                      "group relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                      isOutbound 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-card border rounded-tl-none"
                    )}
                  >
                    {msg.content_text}
                    
                    <span className={cn(
                      "mt-1 block text-[10px] opacity-70",
                      isOutbound ? "text-right" : "text-left"
                    )}>
                      {formatDate(msg.created_at)}
                    </span>
                  </div>

                  {isOutbound && isLastOfGroup && (
                    <div className={cn(
                      "mb-1 h-6 w-6 shrink-0 rounded-full border flex items-center justify-center",
                      msg.sender_type === 'ai' ? "bg-violet-500/10 border-violet-500/20" : "bg-primary/10 border-primary/20"
                    )}>
                      {msg.sender_type === 'ai' 
                        ? <Bot className="h-3 w-3 text-violet-500" />
                        : <UserCheck className="h-3 w-3 text-primary" />
                      }
                    </div>
                  )}
                  {isOutbound && !isLastOfGroup && <div className="h-6 w-6 shrink-0" />}
                </div>

                {isLastOfGroup && (
                  <span className={cn(
                    "mt-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40",
                    isOutbound ? "text-right" : "text-left"
                  )}>
                    {msg.sender_type}
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
