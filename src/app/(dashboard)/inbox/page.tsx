'use client'

import { useState } from 'react'
import { ConversationList } from '@/components/inbox/ConversationList'
import { ConversationThread } from '@/components/inbox/ConversationThread'
import { ConversationDetails } from '@/components/inbox/ConversationDetails'
import { MessageComposer } from '@/components/inbox/MessageComposer'
import { useConversations } from '@/hooks/useConversations'
import { useMessages } from '@/hooks/useMessages'

export default function InboxPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const { conversations, loading: convLoading } = useConversations()
  const { messages, loading: msgLoading } = useMessages(selectedId)

  const selectedConversation = conversations.find(c => c.id === selectedId)

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
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-2xl border bg-card shadow-2xl">
      {/* List Column */}
      <div className="w-80 flex-shrink-0">
        <ConversationList 
          conversations={conversations} 
          loading={convLoading} 
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex-1 overflow-hidden">
          <ConversationThread 
            messages={messages} 
            loading={msgLoading} 
            conversationId={selectedId}
          />
        </div>
        
        <MessageComposer 
          conversationId={selectedId} 
          onSend={handleSendMessage}
        />
      </div>

      {/* Details Column */}
      <div className="w-80 flex-shrink-0 lg:block hidden">
        <ConversationDetails conversation={selectedConversation} />
      </div>
    </div>
  )
}
