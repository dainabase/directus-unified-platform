import React from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Dot
} from 'recharts'

const ClientsChart = ({ data, height = 300 }) => {
  const chartData = data || [
    { month: 'Jan', nouveaux: 12, perdus: 2, total: 145 },
    { month: 'Fév', nouveaux: 15, perdus: 3, total: 157 },
    { month: 'Mar', nouveaux: 18, perdus: 1, total: 174 },
    { month: 'Avr', nouveaux: 14, perdus: 2, total: 186 },
    { month: 'Mai', nouveaux: 22, perdus: 4, total: 204 },
    { month: 'Juin', nouveaux: 20, perdus: 2, total: 222 },
  ]

  const CustomDot = (props) => {
    const { cx, cy, fill } = props
    return (
      <motion.circle
        cx={cx}
        cy={cy}
        r={4}
        fill={fill}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="colorNouveaux" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.3}/>
            </linearGradient>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255, 255, 255, 0.05)"
          />
          <XAxis 
            dataKey="month" 
            stroke="rgba(255, 255, 255, 0.5)"
          />
          <YAxis 
            stroke="rgba(255, 255, 255, 0.5)"
          />
          <Tooltip 
            contentStyle={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#8B5CF6"
            strokeWidth={3}
            name="Total clients"
            dot={<CustomDot />}
            activeDot={{ r: 8 }}
          />
          <Line 
            type="monotone" 
            dataKey="nouveaux" 
            stroke="#10B981"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Nouveaux"
            dot={{ r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="perdus" 
            stroke="#EF4444"
            strokeWidth={2}
            strokeDasharray="3 3"
            name="Perdus"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export default ClientsChart