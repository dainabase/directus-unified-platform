import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Code, Eye, Maximize2 } from 'lucide-react';

export interface ComponentDemoProps {
  title: string;
  description: string;
  component: React.ReactNode;
  code: string;
  props?: Array<{
    name: string;
    type: string;
    default?: string;
    description: string;
  }>;
  variants?: string[];
}

export const ComponentDemo: React.FC<ComponentDemoProps> = ({
  title,
  description,
  component,
  code,
  props,
  variants
}) => {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-soft-lg 
        transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50' : ''}
      `}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCode(!showCode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Toggle code"
            >
              {showCode ? <Eye size={18} /> : <Code size={18} />}
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Fullscreen"
            >
              <Maximize2 size={18} />
            </button>
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy code"
            >
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg mb-4">
          <div className="flex items-center justify-center min-h-[120px]">
            {component}
          </div>
        </div>

        {/* Code View */}
        {showCode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm">
                <code className="text-gray-300">{code}</code>
              </pre>
            </div>
          </motion.div>
        )}

        {/* Props Table */}
        {props && props.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold mb-2">Props</h4>
            <div className="space-y-2">
              {props.map((prop) => (
                <div key={prop.name} className="flex justify-between text-sm">
                  <div>
                    <code className="text-purple-600 dark:text-purple-400">{prop.name}</code>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">{prop.type}</span>
                  </div>
                  {prop.default && (
                    <span className="text-gray-500 dark:text-gray-400">
                      default: {prop.default}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Variants */}
        {variants && variants.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold mb-2">Variants</h4>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => (
                <span
                  key={variant}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded"
                >
                  {variant}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};