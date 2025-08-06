import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import styles from './GlassCard.module.css'

const GlassCard = ({ 
  children, 
  className = '', 
  variant = 'default', // default, dark, colored, gradient
  blur = 'medium', // light, medium, strong
  hover = true,
  onClick,
  padding = 'medium', // none, small, medium, large
  animated = true,
  delay = 0,
  ...props 
}) => {
  const cardVariants = {
    initial: animated ? { opacity: 0, y: 20 } : {},
    animate: animated ? { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        delay: delay,
        ease: [0.4, 0, 0.2, 1]
      }
    } : {},
    hover: hover ? {
      scale: 1.02,
      transition: { duration: 0.2 }
    } : {}
  }

  const glassClasses = clsx(
    styles.glassCard,
    styles[`variant-${variant}`],
    styles[`blur-${blur}`],
    styles[`padding-${padding}`],
    {
      [styles.hoverable]: hover,
      [styles.clickable]: onClick
    },
    className
  )

  return (
    <motion.div
      className={glassClasses}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default GlassCard