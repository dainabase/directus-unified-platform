import React from 'react'
import { motion } from 'framer-motion'
import {
  RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, ResponsiveContainer,
  Tooltip
} from 'recharts'

const MetricsRadar = ({ data, height = 300 }) => {
  const chartData = data || [
    { metric: 'Croissance', current: 85, target: 90 },
    { metric: 'Rentabilité', current: 78, target: 85 },
    { metric: 'Satisfaction', current: 92, target: 95 },
    { metric: 'Innovation', current: 70, target: 80 },
    { metric: 'Efficacité', current: 88, target: 90 },
    { metric: 'Qualité', current: 95, target: 95 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={chartData}>
          <defs>
            <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.3}/>
            </linearGradient>
            <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.3}/>
            </linearGradient>
          </defs>
          <PolarGrid 
            stroke="rgba(255, 255, 255, 0.1)"
            radialLines={false}
          />
          <PolarAngleAxis 
            dataKey="metric"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 10 }}
          />
          <Radar
            name="Actuel"
            dataKey="current"
            stroke="#8B5CF6"
            fill="url(#colorCurrent)"
            strokeWidth={2}
          />
          <Radar
            name="Objectif"
            dataKey="target"
            stroke="#3B82F6"
            fill="url(#colorTarget)"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export default MetricsRadar