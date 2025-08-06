// Export centralisé des animations
export * from './variants'
export * from './transitions'

// Hooks personnalisés pour les animations
import { useAnimation } from 'framer-motion'
import { useEffect } from 'react'

// Hook pour animer au scroll
export const useScrollAnimation = (inView, animation = 'fadeInUp') => {
  const controls = useAnimation()
  const animations = require('./variants')
  
  useEffect(() => {
    if (inView) {
      controls.start(animations[animation].animate)
    }
  }, [inView, controls, animation])
  
  return {
    ...animations[animation],
    animate: controls
  }
}

// Hook pour animer au mount
export const useMountAnimation = (animation = 'fadeIn', delay = 0) => {
  const controls = useAnimation()
  const animations = require('./variants')
  
  useEffect(() => {
    controls.start({
      ...animations[animation].animate,
      transition: {
        ...animations[animation].transition,
        delay
      }
    })
  }, [controls, animation, delay])
  
  return {
    ...animations[animation],
    animate: controls
  }
}

// Composants d'animation prédéfinis
export { AnimatePresence, motion } from 'framer-motion'

// Animations CSS pour les éléments non-Framer Motion
export const cssAnimations = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  
  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-10px);
    }
    75% {
      transform: translateX(10px);
    }
  }
  
  /* Classes d'animation */
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.3s ease-out;
  }
  
  .animate-fadeInDown {
    animation: fadeInDown 0.3s ease-out;
  }
  
  .animate-slideInLeft {
    animation: slideInLeft 0.3s ease-out;
  }
  
  .animate-slideInRight {
    animation: slideInRight 0.3s ease-out;
  }
  
  .animate-pulse {
    animation: pulse 2s ease-in-out infinite;
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  .animate-shimmer {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s linear infinite;
  }
  
  .animate-bounce {
    animation: bounce 1s ease-in-out infinite;
  }
  
  .animate-shake {
    animation: shake 0.5s ease-in-out;
  }
`