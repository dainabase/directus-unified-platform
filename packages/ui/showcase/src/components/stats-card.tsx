import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'red';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  badge?: string;
}

const colorClasses = {
  blue: 'text-blue-500',
  purple: 'text-purple-500',
  green: 'text-green-500',
  orange: 'text-orange-500',
  red: 'text-red-500'
};

export const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, value, label, color, trend, badge }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-soft hover:shadow-soft-lg transition-shadow"
    >
      <Icon className={`${colorClasses[color]} mx-auto mb-2`} size={24} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      {trend && (
        <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {trend.isPositive ? '+' : '-'}{trend.value}%
        </p>
      )}
      {badge && (
        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-2">
          {badge}
        </span>
      )}
    </motion.div>
  );
};