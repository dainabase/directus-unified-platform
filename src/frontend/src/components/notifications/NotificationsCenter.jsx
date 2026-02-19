/**
 * NotificationsCenter — S-05-05
 * Dropdown panel for notifications, integrated into TopBar.
 */

import React from 'react'
import {
  Bell, Check, CheckCheck, X, AlertCircle,
  FileText, DollarSign, Users, ShoppingCart,
  MessageSquare, Calendar, Loader2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

const TYPE_CONFIG = {
  quote: { icon: FileText, color: 'text-blue-500 bg-blue-50' },
  invoice: { icon: DollarSign, color: 'text-green-500 bg-green-50' },
  payment: { icon: DollarSign, color: 'text-emerald-500 bg-emerald-50' },
  lead: { icon: Users, color: 'text-purple-500 bg-purple-50' },
  ticket: { icon: AlertCircle, color: 'text-red-500 bg-red-50' },
  order: { icon: ShoppingCart, color: 'text-orange-500 bg-orange-50' },
  message: { icon: MessageSquare, color: 'text-indigo-500 bg-indigo-50' },
  reminder: { icon: Calendar, color: 'text-amber-500 bg-amber-50' },
  system: { icon: Bell, color: 'text-gray-500 bg-gray-50' }
}

const NotificationsCenter = ({
  notifications = [],
  unreadCount = 0,
  isLoading = false,
  onMarkRead,
  onMarkAllRead,
  onClose,
  isMarkingAllRead = false
}) => {
  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white/95 backdrop-blur-lg rounded-xl border border-gray-200/50 shadow-2xl z-50 max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              disabled={isMarkingAllRead}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              {isMarkingAllRead ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <span className="flex items-center gap-1">
                  <CheckCheck size={12} /> Tout lire
                </span>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Aucune notification</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map(n => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system
              const Icon = cfg.icon
              const timeAgo = n.date_created
                ? formatDistanceToNow(new Date(n.date_created), { addSuffix: true, locale: fr })
                : ''

              return (
                <div
                  key={n.id}
                  className={`px-4 py-3 flex items-start gap-3 hover:bg-gray-50/50 transition-colors cursor-pointer ${
                    !n.is_read ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => !n.is_read && onMarkRead?.(n.id)}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.is_read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {n.title || n.message || 'Notification'}
                    </p>
                    {n.message && n.title && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 text-center">
          <span className="text-xs text-gray-400">
            {notifications.length} notification{notifications.length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}

export default NotificationsCenter
