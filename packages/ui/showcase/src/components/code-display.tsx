import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Code2, Maximize2, Minimize2 } from 'lucide-react';

interface CodeDisplayProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({ 
  code, 
  language = 'typescript',
  title,
  showLineNumbers = true 
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <motion.div
      animate={{ height: isExpanded ? 'auto' : undefined }}
      className={`rounded-lg overflow-hidden bg-gray-900 ${isExpanded ? 'fixed inset-4 z-50' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-gray-400" />
          {title && <span className="text-sm text-gray-300">{title}</span>}
          <span className="text-xs text-gray-500">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          >
            {isExpanded ? <Minimize2 size={16} className="text-gray-400" /> : <Maximize2 size={16} className="text-gray-400" />}
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check size={16} className="text-green-400" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy size={16} className="text-gray-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Code */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm">
          <code>
            {lines.map((line, index) => (
              <div key={index} className="flex">
                {showLineNumbers && (
                  <span className="text-gray-600 select-none pr-4 text-right" style={{ minWidth: '3ch' }}>
                    {index + 1}
                  </span>
                )}
                <span className="text-gray-300">{line || ' '}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </motion.div>
  );
};