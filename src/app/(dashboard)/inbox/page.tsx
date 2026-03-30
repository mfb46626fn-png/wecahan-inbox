'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ConversationList } from '@/components/inbox/ConversationList'
import { ConversationThread } from '@/components/inbox/ConversationThread'
import { ConversationDetails } from '@/components/inbox/ConversationDetails'
import { MessageComposer } from '@/components/inbox/MessageComposer'
import { useConversations } from '@/hooks/useConversations'
import { useMessages } from '@/hooks/useMessages'
import { cn } from '@/lib/utils'
import { ChevronLeft, Info } from 'lucide-react'

export default function InboxPage() {
  const searchParams = useSearchParams()
  const initialId = searchParams.get('id')
  const [selectedId, setSelectedId] = useState<string | undefined>(initialId || undefined)
  const [mobileView, setMobileView] = useState<'list' | 'chat' | 'details'>(initialId ? 'chat' : 'list')
  const { conversations, loading: convLoading } = useConversations()
  const { messages, loading: msgLoading } = useMessages(selectedId)

  const selectedConversation = conversations.find(c => c.id === selectedId)

  // Sync selectedId with query param if it changes
  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      setSelectedId(id)
      if (window.innerWidth < 1024) {
        setMobileView('chat')
      }
    }
  }, [searchParams])

  // Handle selection on mobile
  const handleSelect = (id: string) => {
    setSelectedId(id)
    if (window.innerWidth < 1024) {
      setMobileView('chat')
    }
  }

  const handleSendMessage = async (text: string) => {
    if (!selectedId) return

    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId: selectedId,
        text,
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to send message')
    }

    // Optional: If realtime is slow, we could manually fetch or use optimistic UI here.
    // For now, let's keep it clean since useMessages handles the subscription.
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border bg-card shadow-2xl relative">
      {/* List Column */}
      <div className={cn(
        "w-full lg:w-80 flex-shrink-0 border-r transition-all duration-300",
        mobileView !== 'list' && "hidden lg:block"
      )}>
        <ConversationList 
          conversations={conversations} 
          loading={convLoading} 
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>

      {/* Main Workspace */}
      <div className={cn(
        "flex flex-1 flex-col min-w-0 transition-all duration-300",
        mobileView === 'list' && "hidden lg:flex",
        mobileView === 'details' && "hidden lg:flex"
      )}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b lg:hidden bg-background/50 backdrop-blur-md">
          <button 
            onClick={() => setMobileView('list')}
            className="flex items-center text-primary font-bold text-sm"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Inbox
          </button>
          <div className="flex flex-col items-center flex-1 mx-4 overflow-hidden">
             <span className="font-bold text-sm truncate w-full text-center">
               {selectedConversation?.profile_name || 'Chat'}
             </span>
             <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{selectedConversation?.status}</span>
          </div>
          <button 
            onClick={() => setMobileView('details')}
            className="p-2 rounded-full bg-muted"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <ConversationThread 
            messages={messages} 
            loading={msgLoading} 
            conversationId={selectedId}
          />
        </div>
        
        <div className="border-t bg-background/50 backdrop-blur-md">
          <MessageComposer 
            conversationId={selectedId} 
            onSend={handleSendMessage}
          />
        </div>
      </div>

      {/* Details Column */}
      <div className={cn(
        "w-full lg:w-80 flex-shrink-0 transition-all duration-300",
        mobileView !== 'details' && "hidden lg:block",
        mobileView === 'details' && "block"
      )}>
        {/* Mobile Header for Details */}
        <div className="p-4 border-b lg:hidden bg-background">
          <button 
            onClick={() => setMobileView('chat')}
            className="flex items-center text-primary font-bold text-sm"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Chat
          </button>
        </div>
        <ConversationDetails conversation={selectedConversation} />
      </div>
    </div>
  )
}
