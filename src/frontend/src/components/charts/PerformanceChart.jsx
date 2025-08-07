import React from 'react'
import { motion } from 'framer-motion'
import {
  ComposedChart, Line, Bar, Area,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const PerformanceChart = ({ data, height = 300 }) => {
  const chartData = data || [
    { day: 'Lun', visits: 4000, conversion: 24, revenue: 2400 },
    { day: 'Mar', visits: 3000, conversion: 28, revenue: 1398 },
    { day: 'Mer', visits: 2000, conversion: 30, revenue: 9800 },
    { day: 'Jeu', visits: 2780, conversion: 32, revenue: 3908 },
    { day: 'Ven', visits: 1890, conversion: 35, revenue: 4800 },
    { day: 'Sam', visits: 2390, conversion: 38, revenue: 3800 },
    { day: 'Dim', visits: 3490, conversion: 40, revenue: 4300 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis 
            dataKey="day" 
            stroke="rgba(255, 255, 255, 0.5)"
          />
          <YAxis 
            yAxisId="left"
            stroke="rgba(255, 255, 255, 0.5)"
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            stroke="rgba(255, 255, 255, 0.5)"
          />
          <Tooltip 
            contentStyle={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#8B5CF6"
            fill="url(#colorRevenue)"
            name="Revenue (€)"
          />
          <Bar 
            yAxisId="left"
            dataKey="visits" 
            fill="#3B82F6"
            opacity={0.8}
            name="Visites"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="conversion"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ fill: '#10B981', r: 4 }}
            activeDot={{ r: 6 }}
            name="Conversion (%)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export default PerformanceChart