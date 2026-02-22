/**
 * KnowledgeArticlePage — Story 4.7
 * /prestataire/knowledge/:id — Detail d'un article de la base de connaissances.
 * Collection Directus : knowledge_articles (fallback gracieux si inexistante).
 */

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import {
  BookOpen, ArrowLeft, Tag, Clock, FileText
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../../lib/axios'
import { useProviderAuth } from '../hooks/useProviderAuth'

// -- Category colors (shared with KnowledgeBasePage) --
const CATEGORY_COLORS = {
  guides: { bg: 'rgba(0,113,227,0.12)', fg: 'var(--accent-hover)' },
  procedures: { bg: 'rgba(0,113,227,0.10)', fg: 'var(--accent-hover)' },
  technique: { bg: 'rgba(255,149,0,0.12)', fg: 'var(--semantic-orange)' },
  administration: { bg: 'rgba(52,199,89,0.12)', fg: 'var(--semantic-green)' }
}

const getCategoryStyle = (category) =>
  CATEGORY_COLORS[category] || { bg: 'rgba(107,114,128,0.12)', fg: '#6B7280' }

// -- Basic HTML sanitization (strip script tags, event handlers) --
const sanitizeHTML = (html) => {
  if (!html) return ''
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\bon\w+\s*=\s*\S+/gi, '')
    .replace(/javascript\s*:/gi, '')
}

// -- Loading skeleton --
const ArticleSkeleton = () => (
  <div className="max-w-3xl mx-auto space-y-6">
    <div className="h-5 w-48 ds-skeleton rounded" />
    <div className="ds-card p-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-6 w-20 ds-skeleton rounded-full" />
        <div className="h-4 w-32 ds-skeleton rounded" />
      </div>
      <div className="h-8 w-3/4 ds-skeleton rounded" />
      <div className="h-4 w-48 ds-skeleton rounded" />
      <div className="space-y-3 pt-4">
        <div className="h-4 w-full ds-skeleton rounded" />
        <div className="h-4 w-full ds-skeleton rounded" />
        <div className="h-4 w-5/6 ds-skeleton rounded" />
        <div className="h-4 w-full ds-skeleton rounded" />
        <div className="h-4 w-2/3 ds-skeleton rounded" />
      </div>
    </div>
  </div>
)

// -- Main page --
const KnowledgeArticlePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { provider } = useProviderAuth()

  const { data: article, isLoading } = useQuery({
    queryKey: ['knowledge-article', id],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/items/knowledge_articles/${id}`, {
          params: { fields: ['*'] }
        })
        return data?.data || null
      } catch {
        return null
      }
    },
    enabled: !!id
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <ArticleSkeleton />
      </div>
    )
  }

  // Not found state
  if (!article) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/prestataire/knowledge')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--accent)] transition-colors"
        >
          <ArrowLeft size={16} />
          Base de connaissances
        </button>

        <div className="ds-card p-12 text-center max-w-3xl mx-auto">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            Article introuvable
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Cet article n'existe pas ou a ete supprime.
          </p>
          <button
            onClick={() => navigate('/prestataire/knowledge')}
            className="text-sm font-medium hover:opacity-80" style={{ color: 'var(--accent)' }}
          >
            Retour a la base de connaissances
          </button>
        </div>
      </div>
    )
  }

  const catStyle = getCategoryStyle(article.category)
  const tags = Array.isArray(article.tags) ? article.tags : []
  const hasHTMLContent = article.content && /<[a-z][\s\S]*>/i.test(article.content)

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate('/prestataire/knowledge')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--accent)] transition-colors"
      >
        <ArrowLeft size={16} />
        Base de connaissances
      </button>

      {/* Article content */}
      <div className="max-w-3xl mx-auto">
        <div className="ds-card p-8">
          {/* Category + date */}
          <div className="flex items-center gap-3 mb-4">
            {article.category && (
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ background: catStyle.bg, color: catStyle.fg }}>
                {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} />
              {article.date_updated
                ? format(new Date(article.date_updated), 'dd MMMM yyyy', { locale: fr })
                : article.date_created
                  ? format(new Date(article.date_created), 'dd MMMM yyyy', { locale: fr })
                  : ''}
            </span>
            {article.date_updated && article.date_created && article.date_updated !== article.date_created && (
              <span className="text-xs text-gray-400">
                (mis a jour {formatDistanceToNow(new Date(article.date_updated), { addSuffix: true, locale: fr })})
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {article.title}
          </h1>

          {/* Author */}
          {article.author && (
            <p className="text-sm text-gray-500 mb-6">
              Par <span className="font-medium text-gray-700">{article.author}</span>
            </p>
          )}

          {/* Summary */}
          {article.summary && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
              <p className="text-sm text-gray-600 italic">
                {article.summary}
              </p>
            </div>
          )}

          {/* Content */}
          {article.content && (
            <div className="border-t border-gray-100 pt-6">
              {hasHTMLContent ? (
                <div
                  className="prose prose-sm prose-gray max-w-none
                    prose-headings:text-gray-900 prose-headings:font-semibold
                    prose-p:text-gray-700 prose-p:leading-relaxed
                    prose-a:text-[var(--accent-hover)] prose-a:no-underline hover:prose-a:underline
                    prose-li:text-gray-700
                    prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                    prose-pre:bg-gray-900 prose-pre:text-gray-100
                    prose-img:rounded-xl prose-img:shadow-sm"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(article.content) }}
                />
              ) : (
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {article.content}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="border-t border-gray-100 pt-4 mt-6">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag size={14} className="text-gray-400" />
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-block px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default KnowledgeArticlePage
