import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Info,
  X,
  Bell,
  Loader,
  AlertTriangle
} from 'lucide-react';

export const FeedbackSection = () => {
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(65);

  return (
    <div className="space-y-12">
      {/* Alerts */}
      <div>
        <h3 className="modern-subheading mb-2">Alert Messages</h3>
        <p className="modern-body mb-6">Contextual feedback messages for user actions</p>
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start">
            <Info className="w-5 h-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Information</h4>
              <p className="text-gray-600 text-sm mt-1">This is an informational alert message.</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 flex items-start">
            <CheckCircle className="w-5 h-5 text-gray-700 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Success</h4>
              <p className="text-gray-600 text-sm mt-1">Your changes have been saved successfully.</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start">
            <AlertTriangle className="w-5 h-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Warning</h4>
              <p className="text-gray-600 text-sm mt-1">Please review your settings before continuing.</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start">
            <XCircle className="w-5 h-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Error</h4>
              <p className="text-gray-600 text-sm mt-1">There was an error processing your request.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <div>
        <h3 className="modern-subheading mb-2">Toast Notifications</h3>
        <p className="modern-body mb-6">Temporary messages that appear and disappear</p>
        <div className="modern-card">
          <button 
            onClick={() => setShowToast(true)}
            className="modern-button modern-button-primary"
          >
            Show Toast
          </button>
          
          {showToast && (
            <div className="fixed bottom-4 right-4 bg-gray-900 text-white rounded-lg shadow-lg p-4 flex items-center gap-3 animate-slide-up">
              <CheckCircle className="w-5 h-5" />
              <span>Action completed successfully!</span>
              <button 
                onClick={() => setShowToast(false)}
                className="ml-4 hover:opacity-80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bars */}
      <div>
        <h3 className="modern-subheading mb-2">Progress Indicators</h3>
        <p className="modern-body mb-6">Show progress of ongoing operations</p>
        <div className="space-y-6">
          <div className="modern-card">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">File Upload</span>
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => setProgress(Math.max(0, progress - 10))}
                className="modern-button modern-button-secondary"
              >
                Decrease
              </button>
              <button 
                onClick={() => setProgress(Math.min(100, progress + 10))}
                className="modern-button modern-button-primary"
              >
                Increase
              </button>
            </div>
          </div>

          <div className="modern-card">
            <h4 className="font-medium mb-4">Indeterminate Progress</h4>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-gray-600 h-2 rounded-full animate-pulse w-1/3" />
            </div>
          </div>
        </div>
      </div>

      {/* Loading States */}
      <div>
        <h3 className="modern-subheading mb-2">Loading States</h3>
        <p className="modern-body mb-6">Different loading indicators</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="modern-card text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm">Spinner</p>
          </div>
          
          <div className="modern-card text-center">
            <div className="flex gap-1 justify-center mb-2">
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            </div>
            <p className="text-sm">Dots</p>
          </div>
          
          <div className="modern-card text-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm">Ring</p>
          </div>
          
          <div className="modern-card text-center">
            <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2 overflow-hidden">
              <div className="h-full bg-gray-600 animate-pulse" />
            </div>
            <p className="text-sm">Pulse</p>
          </div>
        </div>
      </div>

      {/* Modal/Dialog */}
      <div>
        <h3 className="modern-subheading mb-2">Modal Dialogs</h3>
        <p className="modern-body mb-6">Overlay dialogs for important interactions</p>
        <div className="modern-card">
          <button 
            onClick={() => setShowModal(true)}
            className="modern-button modern-button-primary"
          >
            Open Modal
          </button>
          
          {showModal && (
            <>
              <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowModal(false)} />
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-6 z-50 w-full max-w-md">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">Modal Title</h3>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  This is a modal dialog. Use it for important messages or actions that require user confirmation.
                </p>
                <div className="flex gap-3 justify-end">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="modern-button modern-button-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="modern-button modern-button-primary"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notification Center */}
      <div>
        <h3 className="modern-subheading mb-2">Notification Center</h3>
        <p className="modern-body mb-6">Manage user notifications</p>
        <div className="modern-card p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h4 className="font-semibold">Notifications</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">3 new</span>
              <Bell className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {[
              { title: 'New message', desc: 'You have a new message from John', time: '5m ago', read: false },
              { title: 'Update complete', desc: 'System update completed successfully', time: '1h ago', read: false },
              { title: 'Weekly report', desc: 'Your weekly report is ready', time: '2h ago', read: true },
            ].map((notif, i) => (
              <div key={i} className={`p-4 hover:bg-gray-50 cursor-pointer ${!notif.read ? 'bg-gray-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{notif.title}</h5>
                    <p className="text-sm text-gray-600 mt-1">{notif.desc}</p>
                  </div>
                  <span className="text-xs text-gray-500">{notif.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skeleton Loaders */}
      <div>
        <h3 className="modern-subheading mb-2">Skeleton Loaders</h3>
        <p className="modern-body mb-6">Placeholder content while loading</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="modern-card">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
          
          <div className="modern-card">
            <div className="animate-pulse flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty States */}
      <div>
        <h3 className="modern-subheading mb-2">Empty States</h3>
        <p className="modern-body mb-6">Helpful messages when there's no data</p>
        <div className="modern-card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="font-semibold mb-2">No data found</h4>
          <p className="text-gray-600 mb-4">There are no items to display at the moment.</p>
          <button className="modern-button modern-button-primary">
            Add First Item
          </button>
        </div>
      </div>
    </div>
  );
};