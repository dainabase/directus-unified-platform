/**
 * KnowledgeBasePage — Story 4.7
 * /prestataire/knowledge — Base de connaissances prestataire.
 * Collection Directus : knowledge_base (fallback gracieux si inexistante).
 * Fields: id, title, slug, category, content, attachments, visible_to, status, author_id, date_created, date_updated
 */

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Search, Tag, Clock, ChevronRight, FileText
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../../lib/axios'
import { useProviderAuth } from '../hooks/useProviderAuth'

// -- Category configuration --
const CATEGORIES = [
  { key: 'all', label: 'Tout' },
  { key: 'guides', label: 'Guides' },
  { key: 'procedures', label: 'Procedures' },
  { key: 'technique', label: 'Technique' },
  { key: 'administration', label: 'Administration' }
]

const CATEGORY_COLORS = {
  guides: { bg: 'rgba(0,113,227,0.12)', fg: '#0071E3' },
  procedures: { bg: 'rgba(0,113,227,0.10)', fg: '#0071E3' },
  technique: { bg: 'rgba(255,149,0,0.12)', fg: '#FF9500' },
  administration: { bg: 'rgba(52,199,89,0.12)', fg: '#34C759' }
}

const getCategoryStyle = (category) =>
  CATEGORY_COLORS[category] || { bg: 'rgba(107,114,128,0.12)', fg: '#6B7280' }

// -- Skeleton card --
const SkeletonCard = () => (
  <div className="ds-card p-5">
    <div className="h-5 w-20 ds-skeleton rounded mb-3" />
    <div className="h-5 w-3/4 ds-skeleton rounded mb-2" />
    <div className="h-4 w-full ds-skeleton rounded mb-1" />
    <div className="h-4 w-2/3 ds-skeleton rounded mb-4" />
    <div className="flex gap-2 mb-3">
      <div className="h-5 w-14 ds-skeleton rounded-full" />
      <div className="h-5 w-14 ds-skeleton rounded-full" />
    </div>
    <div className="h-4 w-24 ds-skeleton rounded" />
  </div>
)

// -- Article card --
const ArticleCard = ({ article, onClick }) => {
  const catStyle = getCategoryStyle(article.category)
  const tags = Array.isArray(article.tags) ? article.tags : []

  return (
    <button
      onClick={onClick}
      className="ds-card p-5 text-left w-full transition-all hover:shadow-md hover:-translate-y-0.5 group"
    >
      {/* Category badge */}
      {article.category && (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-3"
          style={{ background: catStyle.bg, color: catStyle.fg }}>
          {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
        </span>
      )}

      {/* Title */}
      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#0071E3] transition-colors mb-1.5 line-clamp-2">
        {article.title}
      </h3>

      {/* Summary */}
      {article.summary && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {article.summary}
        </p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.slice(0, 4).map((tag, i) => (
            <span
              key={i}
              className="inline-block px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500"
            >
              {tag}
            </span>
          ))}
          {tags.length > 4 && (
            <span className="text-xs text-gray-400">+{tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer: date + arrow */}
      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={12} />
          {article.date_updated
            ? formatDistanceToNow(new Date(article.date_updated), { addSuffix: true, locale: fr })
            : article.date_created
              ? formatDistanceToNow(new Date(article.date_created), { addSuffix: true, locale: fr })
              : ''}
        </span>
        <span className="flex items-center gap-0.5 text-xs font-medium text-[#0071E3] opacity-0 group-hover:opacity-100 transition-opacity">
          Lire <ChevronRight size={14} />
        </span>
      </div>
    </button>
  )
}

// -- Main page --
const KnowledgeBasePage = () => {
  const { provider } = useProviderAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Debounced search for query key (simple approach: use raw value, staleTime handles caching)
  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ['knowledge-base', searchTerm, selectedCategory],
    queryFn: async () => {
      try {
        const params = {
          fields: ['id', 'title', 'content', 'category', 'date_created', 'date_updated', 'author_id'],
          sort: ['-date_updated'],
          limit: 50,
          filter: { status: { _eq: 'published' } }
        }
        if (selectedCategory && selectedCategory !== 'all') {
          params.filter.category = { _eq: selectedCategory }
        }
        if (searchTerm) {
          params.search = searchTerm
        }
        const { data } = await api.get('/items/knowledge_base', { params })
        const items = data?.data || []
        return items.map(item => ({
          ...item,
          summary: item.content ? item.content.replace(/<[^>]*>/g, '').slice(0, 200) : '',
          author: item.author_id,
          tags: item.category ? [item.category] : []
        }))
      } catch (err) {
        // Collection knowledge_base may not exist -- return empty gracefully
        if (err?.response?.status === 403 || err?.response?.status === 404) return []
        throw err
      }
    },
    staleTime: 1000 * 60 * 5
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="ds-page-title text-2xl font-bold text-gray-900">
          Base de connaissances
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Guides, procedures et documentation technique pour les prestataires HYPERVISUAL
        </p>
      </div>

      {/* Search + category filter bar */}
      <div className="ds-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un article..."
              className="ds-input w-full pl-10"
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === cat.key
                    ? 'bg-[#0071E3] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Articles grid */}
      {!isLoading && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={() => navigate(`/prestataire/knowledge/${article.id}`)}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && articles.length === 0 && (
        <div className="ds-card p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            Aucun article disponible
          </p>
          <p className="text-xs text-gray-500">
            La base de connaissances sera bientot alimentee par HYPERVISUAL.
          </p>
        </div>
      )}
    </div>
  )
}

export default KnowledgeBasePage
