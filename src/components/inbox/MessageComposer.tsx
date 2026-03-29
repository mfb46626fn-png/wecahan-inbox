'use client'

import { useState } from 'react'
import { Send, Smile, Paperclip, Zap, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageComposerProps {
  conversationId?: string
  onSend: (text: string) => Promise<void>
}

export function MessageComposer({ conversationId, onSend }: MessageComposerProps) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!text.trim() || !conversationId || sending) return

    setSending(true)
    try {
      await onSend(text)
      setText('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!conversationId) return null

  return (
    <div className="border-t bg-card p-4 space-y-3">
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={2}
            className="w-full resize-none rounded-xl border bg-muted/30 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary h-[84px] transition-all scrollbar-thin scrollbar-thumb-muted"
            disabled={sending}
          />
          
          <div className="absolute right-3 bottom-3 flex items-center space-x-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
              <Smile className="h-5 w-5" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
              <Paperclip className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/10">
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>Quick Reply</span>
          </button>
          <span className="text-[10px] text-muted-foreground italic">
            Enter to send, Shift+Enter for new line
          </span>
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className={cn(
            "flex h-10 items-center justify-center space-x-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:grayscale",
            sending && "cursor-not-allowed"
          )}
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span>Send</span>
        </button>
      </div>
    </div>
  )
}
