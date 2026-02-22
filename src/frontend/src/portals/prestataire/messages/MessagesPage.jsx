/**
 * MessagesPage -- Story 4.6
 * CEO <-> Prestataire messaging system.
 * 2-panel layout: conversations list (left) + messages thread (right).
 * Uses Directus collection `messages` filtered by provider_id.
 * Fields: id, sender_id, recipient_id, project_id, content, attachments, read_at, date_created
 * Responsive: mobile shows one panel at a time.
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MessageSquare, Send, Search, Clock, User,
  Loader2, Paperclip, Plus, ArrowLeft, X
} from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'
import api from '../../../lib/axios'
import { useProviderAuth } from '../hooks/useProviderAuth'

// ── Date formatting helpers ──

const formatMessageDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isToday(date)) return format(date, 'HH:mm', { locale: fr })
  if (isYesterday(date)) return 'Hier ' + format(date, 'HH:mm', { locale: fr })
  return format(date, 'dd.MM.yyyy HH:mm', { locale: fr })
}

const formatConversationDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isToday(date)) return format(date, 'HH:mm', { locale: fr })
  if (isYesterday(date)) return 'Hier'
  return format(date, 'dd.MM', { locale: fr })
}

// ── Skeleton loaders ──

const ConversationSkeleton = () => (
  <div className="space-y-1 p-3">
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
        <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-3.5 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="h-3 bg-gray-100 rounded w-10" />
      </div>
    ))}
  </div>
)

// ── New conversation form ──

const NewConversationForm = ({ providerId, onCancel, onSent }) => {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [projectId, setProjectId] = useState('')
  const queryClient = useQueryClient()

  // Fetch provider's projects for the optional project selector
  const { data: projects = [] } = useQuery({
    queryKey: ['provider-projects-for-msg', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/projects', {
        params: {
          filter: {
            main_provider_id: { _eq: providerId },
            status: { _in: ['active', 'in_progress', 'in-progress'] }
          },
          fields: ['id', 'name'],
          sort: ['name']
        }
      })
      return data?.data || []
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 5
  })

  const sendMutation = useMutation({
    mutationFn: async () => {
      await api.post('/items/messages', {
        sender_id: providerId,
        subject: subject.trim() || 'Message',
        content: content.trim(),
        project_id: projectId || null,
        read_at: null,
        date_created: new Date().toISOString()
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-conversations'] })
      toast.success('Message envoye')
      onSent?.()
    },
    onError: () => toast.error('Erreur envoi')
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) return
    sendMutation.mutate()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Form header */}
      <div
        className="flex items-center justify-between p-4"
        style={{ borderBottom: '1px solid var(--sep)' }}
      >
        <h2 className="text-sm font-semibold text-gray-900">Nouveau message</h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Form fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Sujet</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Objet du message..."
            className="ds-input w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Projet (optionnel)
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="ds-input w-full"
          >
            <option value="">-- Aucun projet --</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ecrivez votre message..."
            rows={6}
            className="ds-input w-full resize-none"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="p-4" style={{ borderTop: '1px solid var(--sep)' }}>
        <button
          type="submit"
          disabled={!content.trim() || sendMutation.isPending}
          className="ds-btn-primary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendMutation.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          Envoyer
        </button>
      </div>
    </form>
  )
}

// ── Conversation list item ──

const ConversationItem = ({ conversation, isActive, isUnread, onClick }) => {
  const preview = conversation.lastMessage?.content || ''
  const truncated = preview.length > 60 ? preview.slice(0, 60) + '...' : preview

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-colors ${
        isActive
          ? 'bg-blue-50 border border-blue-100'
          : 'hover:bg-gray-50 border border-transparent'
      }`}
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
        isActive ? 'bg-[var(--accent-hover)]' : 'bg-gray-200'
      }`}>
        <User size={18} className={isActive ? 'text-white' : 'text-gray-500'} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium truncate ${
            isUnread ? 'text-gray-900' : 'text-gray-700'
          }`}>
            {conversation.subject || 'Sans sujet'}
          </p>
          <span className="text-xs text-gray-400 shrink-0 ml-2">
            {formatConversationDate(conversation.lastMessage?.date_created)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {conversation.projectName && (
            <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
              {conversation.projectName}
            </span>
          )}
          <p className="text-xs text-gray-500 truncate">{truncated || 'Aucun message'}</p>
        </div>
      </div>

      {/* Unread dot */}
      {isUnread && (
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-hover)] shrink-0" />
      )}
    </button>
  )
}

// ── Message bubble ──

const MessageBubble = ({ message, isOutgoing }) => (
  <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
      isOutgoing
        ? 'bg-[var(--accent-hover)] text-white rounded-br-md'
        : 'bg-gray-100 text-gray-900 rounded-bl-md'
    }`}>
      {!isOutgoing && (
        <p className="text-xs font-medium text-blue-700 mb-1">HYPERVISUAL</p>
      )}
      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      <p className={`text-xs mt-1.5 ${isOutgoing ? 'text-blue-200' : 'text-gray-400'}`}>
        {formatMessageDate(message.date_created)}
      </p>
    </div>
  </div>
)

// ── Main page component ──

const MessagesPage = () => {
  const { provider } = useProviderAuth()
  const providerId = provider?.id
  const queryClient = useQueryClient()

  const [selectedConversationKey, setSelectedConversationKey] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [mobileShowThread, setMobileShowThread] = useState(false)

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // ── Fetch all messages for this provider ──
  const { data: rawMessages = [], isLoading } = useQuery({
    queryKey: ['provider-conversations', providerId],
    queryFn: async () => {
      const { data } = await api.get('/items/messages', {
        params: {
          filter: {
            _or: [
              { sender_id: { _eq: providerId } },
              { recipient_id: { _eq: providerId } }
            ]
          },
          fields: [
            'id', 'subject', 'content', 'date_created',
            'sender_id', 'recipient_id',
            'read_at', 'project_id.name', 'project_id.id'
          ],
          sort: ['-date_created'],
          limit: 50
        }
      })
      return data?.data || []
    },
    enabled: !!providerId,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30
  })

  // ── Group messages into conversations by subject + project ──
  const conversations = useMemo(() => {
    const grouped = {}

    rawMessages.forEach(msg => {
      // Group key: subject (lowercased) + project_id
      const projectId = typeof msg.project_id === 'object' ? msg.project_id?.id : msg.project_id
      const projectName = typeof msg.project_id === 'object' ? msg.project_id?.name : null
      const subject = (msg.subject || 'Sans sujet').trim()
      const key = `${subject.toLowerCase()}::${projectId || 'none'}`

      if (!grouped[key]) {
        grouped[key] = {
          key,
          subject,
          projectId,
          projectName,
          messages: [],
          lastMessage: null,
          hasUnread: false
        }
      }

      grouped[key].messages.push({
        ...msg,
        _projectId: projectId,
        _projectName: projectName
      })

      // Track unread incoming messages
      if (
        !msg.read_at &&
        msg.sender_id !== providerId
      ) {
        grouped[key].hasUnread = true
      }
    })

    // Sort messages within each conversation (oldest first) and set lastMessage
    Object.values(grouped).forEach(conv => {
      conv.messages.sort((a, b) => new Date(a.date_created) - new Date(b.date_created))
      conv.lastMessage = conv.messages[conv.messages.length - 1]
    })

    // Sort conversations by most recent message
    return Object.values(grouped).sort(
      (a, b) => new Date(b.lastMessage?.date_created) - new Date(a.lastMessage?.date_created)
    )
  }, [rawMessages, providerId])

  // ── Filter conversations by search ──
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const q = searchQuery.toLowerCase()
    return conversations.filter(c =>
      c.subject.toLowerCase().includes(q) ||
      (c.projectName && c.projectName.toLowerCase().includes(q)) ||
      c.messages.some(m => m.content?.toLowerCase().includes(q))
    )
  }, [conversations, searchQuery])

  // ── Selected conversation ──
  const selectedConversation = useMemo(() => {
    if (!selectedConversationKey) return null
    return conversations.find(c => c.key === selectedConversationKey) || null
  }, [conversations, selectedConversationKey])

  // ── Scroll to bottom on thread change or new messages ──
  useEffect(() => {
    if (selectedConversation) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [selectedConversation?.messages?.length, selectedConversationKey])

  // ── Select a conversation ──
  const handleSelectConversation = useCallback((convKey) => {
    setSelectedConversationKey(convKey)
    setShowNewConversation(false)
    setMobileShowThread(true)

    // Mark unread messages as read
    const conv = conversations.find(c => c.key === convKey)
    if (conv?.hasUnread) {
      const unreadIds = conv.messages
        .filter(m => !m.read_at && m.sender_id !== providerId)
        .map(m => m.id)

      if (unreadIds.length > 0) {
        // Mark each as read (batch)
        Promise.all(
          unreadIds.map(id => api.patch(`/items/messages/${id}`, { read_at: new Date().toISOString() }))
        ).then(() => {
          queryClient.invalidateQueries({ queryKey: ['provider-conversations'] })
        }).catch(() => { /* silent */ })
      }
    }
  }, [conversations, providerId, queryClient])

  // ── Send message mutation ──
  const sendMessageMutation = useMutation({
    mutationFn: async ({ subject, content, projectId }) => {
      await api.post('/items/messages', {
        sender_id: providerId,
        subject: subject || selectedConversation?.subject || 'Message',
        content,
        project_id: projectId || null,
        read_at: null,
        date_created: new Date().toISOString()
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-conversations'] })
      setNewMessage('')
      textareaRef.current?.focus()
    },
    onError: () => toast.error('Erreur envoi')
  })

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return
    sendMessageMutation.mutate({
      subject: selectedConversation.subject,
      content: newMessage.trim(),
      projectId: selectedConversation.projectId || null
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  // ── Mobile back button ──
  const handleMobileBack = () => {
    setMobileShowThread(false)
    setSelectedConversationKey(null)
  }

  const handleNewConversationSent = () => {
    setShowNewConversation(false)
  }

  const isOutgoing = (msg) => msg.sender_id === providerId

  // ── Total unread count ──
  const unreadCount = conversations.filter(c => c.hasUnread).length

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500 mt-1">
          Communiquez avec HYPERVISUAL
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent-hover)] text-white">
              {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      {/* 2-panel layout */}
      <div className="ds-card overflow-hidden" style={{ height: 'calc(100vh - 10rem)' }}>
        <div className="flex h-full">

          {/* ═══ LEFT PANEL: Conversations list ═══ */}
          <div
            className={`w-full md:w-80 shrink-0 ds-glass flex flex-col h-full ${
              mobileShowThread ? 'hidden md:flex' : 'flex'
            }`}
            style={{ borderRight: '1px solid var(--sep)' }}
          >
            {/* New message + Search */}
            <div className="p-3 space-y-2" style={{ borderBottom: '1px solid var(--sep)' }}>
              <button
                onClick={() => {
                  setShowNewConversation(true)
                  setSelectedConversationKey(null)
                  setMobileShowThread(true)
                }}
                className="ds-btn-primary w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium"
              >
                <Plus size={16} />
                Nouveau message
              </button>

              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="ds-input w-full pl-9 py-2 text-sm"
                />
              </div>
            </div>

            {/* Conversations list */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <ConversationSkeleton />
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-500">Aucun message</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {searchQuery
                      ? 'Aucun resultat pour cette recherche'
                      : 'Envoyez votre premier message a HYPERVISUAL'}
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-0.5">
                  {filteredConversations.map(conv => (
                    <ConversationItem
                      key={conv.key}
                      conversation={conv}
                      isActive={selectedConversationKey === conv.key}
                      isUnread={conv.hasUnread}
                      onClick={() => handleSelectConversation(conv.key)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ═══ RIGHT PANEL: Messages thread or new conversation form ═══ */}
          <div
            className={`flex-1 flex flex-col h-full bg-white ${
              mobileShowThread ? 'flex' : 'hidden md:flex'
            }`}
          >
            {showNewConversation ? (
              // ── New conversation form ──
              <NewConversationForm
                providerId={providerId}
                onCancel={() => {
                  setShowNewConversation(false)
                  setMobileShowThread(false)
                }}
                onSent={handleNewConversationSent}
              />
            ) : selectedConversation ? (
              // ── Active conversation thread ──
              <>
                {/* Thread header */}
                <div
                  className="flex items-center gap-3 p-4"
                  style={{ borderBottom: '1px solid var(--sep)' }}
                >
                  {/* Mobile back button */}
                  <button
                    onClick={handleMobileBack}
                    className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="w-9 h-9 rounded-full bg-[var(--accent-hover)] flex items-center justify-center shrink-0">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold text-gray-900 truncate">
                      {selectedConversation.subject}
                    </h2>
                    {selectedConversation.projectName && (
                      <p className="text-xs text-gray-500">
                        Projet : {selectedConversation.projectName}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {selectedConversation.messages.length} message{selectedConversation.messages.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Messages thread */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedConversation.messages.map(msg => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOutgoing={isOutgoing(msg)}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4"
                  style={{ borderTop: '1px solid var(--sep)' }}
                >
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ecrivez votre message..."
                      rows={2}
                      className="ds-input flex-1 resize-none py-2.5 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      className="p-2.5 rounded-xl bg-[var(--accent-hover)] text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                      {sendMessageMutation.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              // ── No conversation selected ──
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-500">
                  Selectionnez une conversation
                </h3>
                <p className="text-sm text-gray-400 mt-1 max-w-xs">
                  Choisissez une conversation dans la liste ou envoyez un nouveau message a HYPERVISUAL.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MessagesPage
