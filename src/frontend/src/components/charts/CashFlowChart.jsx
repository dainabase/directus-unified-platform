import React from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts'

const CashFlowChart = ({ data, height = 300 }) => {
  const chartData = data || [
    { month: 'Jan', entrees: 320000, sorties: -280000, net: 40000 },
    { month: 'Fév', entrees: 350000, sorties: -290000, net: 60000 },
    { month: 'Mar', entrees: 380000, sorties: -310000, net: 70000 },
    { month: 'Avr', entrees: 360000, sorties: -320000, net: 40000 },
    { month: 'Mai', entrees: 420000, sorties: -340000, net: 80000 },
    { month: 'Juin', entrees: 450000, sorties: -350000, net: 100000 },
  ]

  const CustomBar = (props) => {
    const { fill, x, y, width, height } = props
    return (
      <motion.rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ 
          duration: 0.5,
          delay: props.index * 0.05,
          ease: "easeOut"
        }}
        style={{ transformOrigin: 'bottom' }}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData}>
          <defs>
            <linearGradient id="gradientEntrees" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={1}/>
              <stop offset="100%" stopColor="#10B981" stopOpacity={0.6}/>
            </linearGradient>
            <linearGradient id="gradientSorties" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={1}/>
              <stop offset="100%" stopColor="#EF4444" stopOpacity={0.6}/>
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
            tickFormatter={(value) => `€${(value/1000).toFixed(0)}K`}
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
          <Bar 
            dataKey="entrees" 
            fill="url(#gradientEntrees)"
            name="Entrées"
            radius={[8, 8, 0, 0]}
          />
          <Bar 
            dataKey="sorties" 
            fill="url(#gradientSorties)"
            name="Sorties"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export default CashFlowChart