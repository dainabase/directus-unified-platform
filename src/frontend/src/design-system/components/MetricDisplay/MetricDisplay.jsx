import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'
import styles from './MetricDisplay.module.css'

const MetricDisplay = ({
  label,
  value,
  prefix = '',
  suffix = '',
  trend = null, // 'up', 'down', 'neutral'
  trendValue = '',
  trendLabel = '',
  sparkline = null,
  icon = null,
  variant = 'default', // default, success, warning, danger, info
  size = 'medium', // small, medium, large
  animated = true,
  className = ''
}) => {
  const getTrendIcon = () => {
    switch(trend) {
      case 'up': return <TrendingUp className={styles.trendIconUp} />
      case 'down': return <TrendingDown className={styles.trendIconDown} />
      case 'neutral': return <Minus className={styles.trendIconNeutral} />
      default: return null
    }
  }

  const metricClasses = clsx(
    styles.metricDisplay,
    styles[`size-${size}`],
    styles[`variant-${variant}`],
    className
  )

  const valueVariants = {
    initial: animated ? { scale: 0.5, opacity: 0 } : {},
    animate: animated ? { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    } : {}
  }

  return (
    <div className={metricClasses}>
      {icon && (
        <div className={styles.iconContainer}>
          {icon}
        </div>
      )}
      
      <div className={styles.content}>
        {label && (
          <div className={styles.label}>{label}</div>
        )}
        
        <motion.div 
          className={styles.valueContainer}
          variants={valueVariants}
          initial="initial"
          animate="animate"
        >
          <span className={styles.prefix}>{prefix}</span>
          <span className={styles.value}>{value}</span>
          <span className={styles.suffix}>{suffix}</span>
        </motion.div>
        
        {(trend || trendValue) && (
          <div className={styles.trendContainer}>
            {getTrendIcon()}
            {trendValue && (
              <span className={clsx(styles.trendValue, styles[`trend-${trend}`])}>
                {trendValue}
              </span>
            )}
            {trendLabel && (
              <span className={styles.trendLabel}>{trendLabel}</span>
            )}
          </div>
        )}
        
        {sparkline && (
          <div className={styles.sparklineContainer}>
            {sparkline}
          </div>
        )}
      </div>
    </div>
  )
}

export default MetricDisplay