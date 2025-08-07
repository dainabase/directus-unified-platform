import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip, Legend, Sector
} from 'recharts'

const ProjectsChart = ({ data, height = 300 }) => {
  const [activeIndex, setActiveIndex] = useState(null)
  
  const chartData = data || [
    { name: 'Terminés', value: 12, color: '#10B981' },
    { name: 'En cours', value: 8, color: '#3B82F6' },
    { name: 'En retard', value: 3, color: '#F59E0B' },
    { name: 'Bloqués', value: 2, color: '#EF4444' },
  ]

  const onPieEnter = (_, index) => setActiveIndex(index)
  const onPieLeave = () => setActiveIndex(null)

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props
    
    return (
      <g>
        <text 
          x={cx} 
          y={cy - 10} 
          fill="white" 
          textAnchor="middle" 
          dominantBaseline="middle"
          style={{ fontSize: '24px', fontWeight: 'bold' }}
        >
          {value}
        </text>
        <text 
          x={cx} 
          y={cy + 15} 
          fill="rgba(255,255,255,0.7)" 
          textAnchor="middle" 
          dominantBaseline="middle"
          style={{ fontSize: '14px' }}
        >
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, rotate: -180 }}
      animate={{ opacity: 1, rotate: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                style={{
                  filter: activeIndex === index ? 'brightness(1.2)' : 'brightness(1)',
                  cursor: 'pointer',
                  transition: 'filter 0.3s ease'
                }}
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            wrapperStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export default ProjectsChart