import React from 'react';
import {
  ChevronRight,
  Download,
  Heart,
  ShoppingCart,
  Send,
  Edit,
  Settings,
  ArrowRight,
  ExternalLink,
  MoreHorizontal,
  RefreshCw,
  Check,
  AlertCircle,
  Upload,
  Save,
  Trash2,
  Plus,
  Copy,
  Share2
} from 'lucide-react';

export const ButtonsSection: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Primary Buttons */}
      <div>
        <h3 className="modern-subheading mb-2">Primary Buttons</h3>
        <p className="modern-body mb-6">Main action buttons for key user interactions</p>
        <div className="modern-preview">
          <div className="flex flex-wrap gap-3">
            <button className="modern-button modern-button-primary">
              Create Project
            </button>
            <button className="modern-button modern-button-primary">
              <Download size={16} /> Export
            </button>
            <button className="modern-button modern-button-primary">
              Continue <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Buttons */}
      <div>
        <h3 className="modern-subheading mb-2">Secondary Buttons</h3>
        <p className="modern-body mb-6">Alternative actions and supporting options</p>
        <div className="modern-preview">
          <div className="flex flex-wrap gap-3">
            <button className="modern-button modern-button-secondary">
              Cancel
            </button>
            <button className="modern-button modern-button-secondary">
              <Edit size={16} /> Edit
            </button>
            <button className="modern-button modern-button-secondary">
              <Settings size={16} /> Settings
            </button>
          </div>
        </div>
      </div>

      {/* Ghost Buttons */}
      <div>
        <h3 className="modern-subheading mb-2">Ghost Buttons</h3>
        <p className="modern-body mb-6">Minimal buttons for tertiary actions</p>
        <div className="modern-preview">
          <div className="flex flex-wrap gap-3">
            <button className="modern-button modern-button-ghost">
              Learn More
            </button>
            <button className="modern-button modern-button-ghost">
              View Details <ArrowRight size={16} />
            </button>
            <button className="modern-button modern-button-ghost">
              <ExternalLink size={16} /> External Link
            </button>
          </div>
        </div>
      </div>

      {/* Icon Only Buttons */}
      <div>
        <h3 className="modern-subheading mb-2">Icon Buttons</h3>
        <p className="modern-body mb-6">Compact buttons with icons only</p>
        <div className="modern-preview">
          <div className="flex flex-wrap gap-3">
            <button className="modern-button modern-button-primary" style={{ padding: '0.75rem' }}>
              <Heart size={18} />
            </button>
            <button className="modern-button modern-button-secondary" style={{ padding: '0.75rem' }}>
              <ShoppingCart size={18} />
            </button>
            <button className="modern-button modern-button-secondary" style={{ padding: '0.75rem' }}>
              <Send size={18} />
            </button>
            <button className="modern-button modern-button-ghost" style={{ padding: '0.75rem' }}>
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Button Sizes */}
      <div>
        <h3 className="modern-subheading mb-2">Button Sizes</h3>
        <p className="modern-body mb-6">Different sizes for various contexts</p>
        <div className="modern-preview">
          <div className="flex flex-wrap items-center gap-3">
            <button className="modern-button modern-button-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
              Small
            </button>
            <button className="modern-button modern-button-primary">
              Medium
            </button>
            <button className="modern-button modern-button-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>
              Large
            </button>
            <button className="modern-button modern-button-primary" style={{ padding: '1.25rem 2.5rem', fontSize: '1.125rem' }}>
              Extra Large
            </button>
          </div>
        </div>
      </div>

      {/* Button States */}
      <div>
        <h3 className="modern-subheading mb-2">Button States</h3>
        <p className="modern-body mb-6">Loading, disabled, and feedback states</p>
        <div className="modern-preview">
          <div className="flex flex-wrap gap-3">
            <button className="modern-button modern-button-primary">
              <RefreshCw size={16} className="animate-spin" /> Loading
            </button>
            <button className="modern-button modern-button-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              Disabled
            </button>
            <button className="modern-button modern-button-primary" style={{ background: '#10b981' }}>
              <Check size={16} /> Success
            </button>
            <button className="modern-button modern-button-secondary" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
              <AlertCircle size={16} /> Error
            </button>
          </div>
        </div>
      </div>

      {/* Button Groups */}
      <div>
        <h3 className="modern-subheading mb-2">Button Groups</h3>
        <p className="modern-body mb-6">Related actions grouped together</p>
        <div className="modern-preview">
          <div className="space-y-4">
            {/* Segmented Control */}
            <div className="inline-flex" style={{ border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-md)' }}>
              <button className="modern-button modern-button-ghost" style={{ borderRadius: 'var(--radius-md) 0 0 var(--radius-md)', borderRight: '1px solid var(--neutral-200)' }}>
                Day
              </button>
              <button className="modern-button modern-button-primary" style={{ borderRadius: '0', borderRight: '1px solid var(--neutral-800)' }}>
                Week
              </button>
              <button className="modern-button modern-button-ghost" style={{ borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                Month
              </button>
            </div>

            {/* Action Group */}
            <div className="flex gap-2">
              <button className="modern-button modern-button-primary">
                <Save size={16} /> Save
              </button>
              <button className="modern-button modern-button-secondary">
                <Copy size={16} /> Duplicate
              </button>
              <button className="modern-button modern-button-ghost" style={{ color: '#ef4444' }}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Buttons */}
      <div>
        <h3 className="modern-subheading mb-2">Full Width Buttons</h3>
        <p className="modern-body mb-6">Buttons that span the full container width</p>
        <div className="modern-preview">
          <div className="space-y-3 max-w-md mx-auto">
            <button className="modern-button modern-button-primary w-full">
              Continue to Checkout
            </button>
            <button className="modern-button modern-button-secondary w-full">
              Sign Up with Email
            </button>
            <button className="modern-button modern-button-ghost w-full">
              Skip for Now
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div>
        <h3 className="modern-subheading mb-2">Floating Action Buttons</h3>
        <p className="modern-body mb-6">Prominent actions that float above content</p>
        <div className="modern-preview">
          <div className="flex gap-3">
            <button className="modern-button modern-button-primary" style={{ 
              borderRadius: '50%', 
              width: '56px', 
              height: '56px', 
              padding: '0',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <Plus size={24} />
            </button>
            <button className="modern-button modern-button-secondary" style={{ 
              borderRadius: '50%', 
              width: '48px', 
              height: '48px', 
              padding: '0',
              boxShadow: 'var(--shadow-md)'
            }}>
              <Share2 size={20} />
            </button>
            <button className="modern-button modern-button-secondary" style={{ 
              borderRadius: '50%', 
              width: '48px', 
              height: '48px', 
              padding: '0',
              boxShadow: 'var(--shadow-md)'
            }}>
              <Upload size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Button with Dropdown */}
      <div>
        <h3 className="modern-subheading mb-2">Split Buttons</h3>
        <p className="modern-body mb-6">Buttons with dropdown options</p>
        <div className="modern-preview">
          <div className="flex gap-3">
            <div className="inline-flex">
              <button className="modern-button modern-button-primary" style={{ borderRadius: 'var(--radius-md) 0 0 var(--radius-md)' }}>
                Deploy
              </button>
              <button className="modern-button modern-button-primary" style={{ 
                borderRadius: '0 var(--radius-md) var(--radius-md) 0', 
                padding: '0.75rem',
                borderLeft: '1px solid rgba(255,255,255,0.2)'
              }}>
                <ChevronRight size={16} style={{ transform: 'rotate(90deg)' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};