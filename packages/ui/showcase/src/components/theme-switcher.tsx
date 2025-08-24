import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeSwitcherProps {
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, onThemeChange }) => {
  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' }
  ];

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex gap-1">
      {themes.map((t) => (
        <motion.button
          key={t.value}
          whileTap={{ scale: 0.95 }}
          onClick={() => onThemeChange(t.value as any)}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors
            ${theme === t.value 
              ? 'bg-white dark:bg-gray-700 shadow-sm' 
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }
          `}
        >
          <t.icon size={16} />
          <span className="text-sm">{t.label}</span>
        </motion.button>
      ))}
    </div>
  );
};