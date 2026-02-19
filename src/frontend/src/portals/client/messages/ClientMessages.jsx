/**
 * ClientMessages — C-06
 * Simple messaging using the comments collection.
 * Uses `name` field as sender ID pattern: "client:{contactId}" or "hypervisual"
 * Uses `description` field as message body.
 */
import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, Send, Loader2 } from 'lucide-react'
import api from '../../../lib/axios'
import { useClientAuth } from '../hooks/useClientAuth'

const formatTime = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + date.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' })
}

const ClientMessages = () => {
  const { client } = useClientAuth()
  const contactId = client?.id
  const clientSenderKey = `client:${contactId}`
  const queryClient = useQueryClient()
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  // Fetch messages (all comments for this owner_company, sorted by date)
  // Client messages have name="client:{contactId}", HYPERVISUAL messages have name containing "hypervisual"
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['client-messages', contactId],
    queryFn: async () => {
      const { data } = await api.get('/items/comments', {
        params: {
          filter: {
            _or: [
              { name: { _eq: clientSenderKey } },
              { name: { _starts_with: 'hypervisual' } },
              { name: { _eq: `reply:${contactId}` } }
            ]
          },
          fields: ['id', 'name', 'description', 'created_at', 'status'],
          sort: ['created_at'],
          limit: 100
        }
      })
      return data?.data || []
    },
    enabled: !!contactId,
    refetchInterval: 15000 // Poll every 15s
  })

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (messageText) => {
      return api.post('/items/comments', {
        name: clientSenderKey,
        description: messageText,
        status: 'active',
        owner_company: 'HYPERVISUAL'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-messages'] })
      setNewMessage('')
    }
  })

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    sendMutation.mutate(newMessage.trim())
  }

  const isFromClient = (msg) => msg.name === clientSenderKey

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-3xl">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 text-sm mt-1">Communiquez avec HYPERVISUAL</p>
      </div>

      {/* Messages area */}
      <div className="flex-1 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/50 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">Aucun message. Envoyez votre premier message à HYPERVISUAL.</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`flex ${isFromClient(msg) ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isFromClient(msg)
                    ? 'bg-emerald-600 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}>
                  {!isFromClient(msg) && (
                    <p className="text-xs font-medium text-emerald-700 mb-1">HYPERVISUAL</p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.description}</p>
                  <p className={`text-xs mt-1 ${isFromClient(msg) ? 'text-emerald-200' : 'text-gray-400'}`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-100">
          <div className="flex items-end gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) } }}
              placeholder="Écrivez votre message..."
              rows={1}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sendMutation.isPending}
              className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sendMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClientMessages
