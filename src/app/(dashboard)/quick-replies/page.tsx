'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, MessageSquareQuote, Edit2, Trash2, Loader2, Save, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export type QuickReply = {
  id: string
  title: string
  content: string
  is_active: boolean
}

export default function QuickRepliesPage() {
  const [replies, setReplies] = useState<QuickReply[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isEditing, setIsEditing] = useState<string | 'new' | null>(null)
  
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  const supabase = createClient()

  const fetchReplies = useCallback(async () => {
    const { data, error } = await supabase
      .from('quick_replies')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching replies:', error)
    } else {
      setReplies(data as QuickReply[])
    }
  }, [supabase])

  useEffect(() => {
    let ignore = false
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReplies().finally(() => {
      if (!ignore) setLoading(false)
    })

    return () => {
      ignore = true
    }
  }, [fetchReplies])

  const handleSave = async () => {
    if (!editTitle || !editContent) return

    if (isEditing === 'new') {
      const { error } = await supabase
        .from('quick_replies')
        .insert({ title: editTitle, content: editContent })
      
      if (error) console.error('Error creating reply:', error)
    } else {
      const { error } = await supabase
        .from('quick_replies')
        .update({ title: editTitle, content: editContent })
        .eq('id', isEditing)
      
      if (error) console.error('Error updating reply:', error)
    }

    setIsEditing(null)
    setEditTitle('')
    setEditContent('')
    fetchReplies()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quick reply?')) return

    const { error } = await supabase
      .from('quick_replies')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting reply:', error)
    } else {
      fetchReplies()
    }
  }

  const startEdit = (reply: QuickReply) => {
    setIsEditing(reply.id)
    setEditTitle(reply.title)
    setEditContent(reply.content)
  }

  const startNew = () => {
    setIsEditing('new')
    setEditTitle('')
    setEditContent('')
  }

  const filteredReplies = replies.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.content.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quick Replies</h1>
          <p className="text-sm text-muted-foreground">Manage predefined templates for faster responses.</p>
        </div>
        <button 
          onClick={startNew}
          className="flex items-center space-x-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
        >
          <Plus className="h-4 w-4" />
          <span>New Template</span>
        </button>
      </div>

      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-card px-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      {isEditing && (
        <div className="rounded-xl border bg-card p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">{isEditing === 'new' ? 'New Quick Reply' : 'Edit Quick Reply'}</h3>
            <button onClick={() => setIsEditing(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Title (Label)</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g., Welcome Message"
                className="w-full rounded-lg border bg-muted/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">Response Content</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Type the message template here..."
                rows={4}
                className="w-full rounded-lg border bg-muted/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => setIsEditing(null)}
              className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center space-x-2 rounded-lg bg-primary px-6 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <Save className="h-4 w-4" />
              <span>Save Template</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredReplies.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl bg-muted/10">
            <MessageSquareQuote className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No quick replies found.</p>
          </div>
        ) : (
          filteredReplies.map((reply) => (
            <div key={reply.id} className="group relative rounded-2xl border bg-card p-6 transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-foreground transition-colors group-hover:text-primary">{reply.title}</h4>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEdit(reply)}
                    className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(reply.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed bg-muted/20 p-3 rounded-lg border border-transparent group-hover:bg-muted/40 group-hover:border-primary/5">
                {reply.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
