/**
 * MarketingRevendeur — Marketing & Assets page for the Revendeur portal
 * Fetches files from Directus /files API (marketing folder/tags).
 * Fetches email templates from Directus email_templates collection.
 */

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Image, FileText, Video, Download, Mail, Folder,
  Search, Loader2, FileIcon, Film
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import { useAuthStore } from '../../stores/authStore'

const API_BASE = import.meta.env.VITE_API_URL || ''

// ── Filter types ──
const FILTER_TYPES = [
  { id: 'all', label: 'Tous' },
  { id: 'image', label: 'Images' },
  { id: 'pdf', label: 'PDF' },
  { id: 'video', label: 'Videos' }
]

// ── Helpers ──

function getFileTypeCategory(mimeType) {
  if (!mimeType) return 'other'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType.startsWith('video/')) return 'video'
  return 'other'
}

function getFileTypeIcon(mimeType) {
  const cat = getFileTypeCategory(mimeType)
  switch (cat) {
    case 'image': return Image
    case 'pdf': return FileText
    case 'video': return Film
    default: return FileIcon
  }
}

function getFileTypeBadge(mimeType) {
  const cat = getFileTypeCategory(mimeType)
  switch (cat) {
    case 'image': return { label: 'Image', bg: 'rgba(0,113,227,0.12)', fg: '#0071E3' }
    case 'pdf': return { label: 'PDF', bg: 'rgba(255,59,48,0.12)', fg: '#FF3B30' }
    case 'video': return { label: 'Video', bg: 'rgba(0,113,227,0.10)', fg: '#0071E3' }
    default: return { label: 'Fichier', bg: 'rgba(107,114,128,0.12)', fg: '#6B7280' }
  }
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function handleDownload(fileId) {
  window.open(`${API_BASE}/assets/${fileId}`, '_blank')
}

// ── Component ──

const MarketingRevendeur = () => {
  const user = useAuthStore((s) => s.user)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch marketing files from Directus /files API
  const { data: files = [], isLoading } = useQuery({
    queryKey: ['revendeur-marketing-assets'],
    queryFn: async () => {
      const { data } = await api.get('/files', {
        params: {
          filter: { _or: [{ tags: { _contains: 'marketing' } }, { folder: { _eq: 'marketing' } }] },
          fields: ['id', 'title', 'filename_download', 'type', 'filesize', 'width', 'height'],
          sort: ['-uploaded_on'],
          limit: 50
        }
      }).catch(() => ({ data: { data: [] } }))
      return data?.data || []
    },
    staleTime: 1000 * 60 * 5
  })

  // Fetch email templates from Directus
  const { data: campaignTemplates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ['revendeur-email-templates'],
    queryFn: async () => {
      const { data } = await api.get('/items/email_templates', {
        params: {
          fields: ['id', 'name', 'type', 'subject_fr', 'language', 'date_created'],
          sort: ['-date_created'],
          limit: 20
        }
      }).catch(() => ({ data: { data: [] } }))
      return data?.data || []
    },
    staleTime: 1000 * 60 * 5
  })

  // Filter files by type and search query
  const filteredFiles = useMemo(() => {
    let result = files

    if (activeFilter !== 'all') {
      result = result.filter((f) => getFileTypeCategory(f.type) === activeFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((f) =>
        (f.title || '').toLowerCase().includes(q) ||
        (f.filename_download || '').toLowerCase().includes(q)
      )
    }

    return result
  }, [files, activeFilter, searchQuery])

  const hasFiles = filteredFiles.length > 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="ds-page-title">Marketing & Assets</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ressources marketing, visuels et templates pour vos campagnes
        </p>
      </div>

      {/* Filter Bar */}
      <div className="ds-card p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Type filter pills */}
          <div className="flex items-center gap-2">
            {FILTER_TYPES.map((ft) => (
              <button
                key={ft.id}
                onClick={() => setActiveFilter(ft.id)}
                className={`
                  ds-btn text-sm px-3 py-1.5
                  ${activeFilter === ft.id ? 'ds-btn-primary' : 'ds-btn-ghost'}
                `}
              >
                {ft.label}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative flex-1 w-full sm:w-auto sm:max-w-xs ml-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un asset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ds-input pl-9 w-full"
            />
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      ) : hasFiles ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => {
            const isImage = getFileTypeCategory(file.type) === 'image'
            const TypeIcon = getFileTypeIcon(file.type)
            const badge = getFileTypeBadge(file.type)
            const displayName = file.title || file.filename_download || 'Sans nom'

            return (
              <div key={file.id} className="ds-card overflow-hidden group">
                {/* Thumbnail / Icon */}
                <div className="h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {isImage ? (
                    <img
                      src={`${API_BASE}/assets/${file.id}?width=300&height=200&fit=cover`}
                      alt={displayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <TypeIcon size={48} className="text-gray-300" />
                  )}
                </div>

                {/* File info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate" title={displayName}>
                        {displayName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: badge.bg, color: badge.fg }}>
                          {badge.label}
                        </span>
                        <span className="text-xs text-gray-400">{formatFileSize(file.filesize)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(file.id)}
                      className="ds-btn ds-btn-ghost p-2 flex-shrink-0"
                      title="Telecharger"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="ds-card p-12 text-center">
          <Folder size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Aucun asset disponible</h3>
          <p className="text-sm text-gray-400">
            {searchQuery
              ? 'Aucun fichier ne correspond a votre recherche.'
              : 'Les ressources marketing seront bientot disponibles dans cet espace.'}
          </p>
        </div>
      )}

      {/* Campaign Templates Section */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Templates de campagne</h2>
        {loadingTemplates ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="ds-card p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-50 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-3 bg-gray-50 rounded w-full mb-2" />
                <div className="h-3 bg-gray-50 rounded w-2/3 mb-4" />
                <div className="h-9 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : campaignTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaignTemplates.map((template) => (
              <div key={template.id} className="ds-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,113,227,0.08)' }}>
                    <Mail size={20} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{template.name}</h3>
                    <span className="text-xs text-gray-400 capitalize">{template.type || 'email'}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {template.subject_fr || 'Aucun sujet'}
                </p>
                <button
                  onClick={() => {
                    toast.info('Template selectionne. Mautic integration en cours.')
                  }}
                  className="ds-btn ds-btn-primary w-full text-sm"
                >
                  Utiliser
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="ds-card p-12 text-center">
            <Mail size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Aucun template disponible</h3>
            <p className="text-sm text-gray-400">
              Les templates de campagne seront bientot disponibles dans cet espace.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MarketingRevendeur
