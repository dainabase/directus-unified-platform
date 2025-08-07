import React from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const RevenueChart = ({ data, height = 300 }) => {
  // Données démo si pas de data
  const chartData = data || [
    { month: 'Jan', arr: 1800000, mrr: 150000, growth: 12 },
    { month: 'Fév', arr: 1950000, mrr: 162500, growth: 15 },
    { month: 'Mar', arr: 2100000, mrr: 175000, growth: 18 },
    { month: 'Avr', arr: 2200000, mrr: 183333, growth: 20 },
    { month: 'Mai', arr: 2350000, mrr: 195833, growth: 23 },
    { month: 'Juin', arr: 2400000, mrr: 200000, growth: 25 },
    { month: 'Juil', arr: 2520000, mrr: 210000, growth: 28 },
    { month: 'Août', arr: 2640000, mrr: 220000, growth: 30 },
  ]

  // Custom Tooltip avec glassmorphism
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null
    
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
      }}>
        <p style={{ color: '#fff', margin: 0, fontWeight: 600 }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} style={{ 
            color: entry.color, 
            margin: '4px 0',
            fontSize: '14px'
          }}>
            {entry.name}: €{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorArr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255, 255, 255, 0.05)"
          />
          <XAxis 
            dataKey="month" 
            stroke="rgba(255, 255, 255, 0.5)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="rgba(255, 255, 255, 0.5)"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `€${(value/1000000).toFixed(1)}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '14px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="arr" 
            stroke="#8B5CF6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorArr)"
            name="ARR"
            animationDuration={1000}
          />
          <Area 
            type="monotone" 
            dataKey="mrr" 
            stroke="#3B82F6"
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorMrr)"
            name="MRR"
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export default RevenueChart