// Variantes d'animation Framer Motion pour le design glassmorphism

// Animations d'apparition
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
}

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' }
}

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3, ease: 'easeOut' }
}

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3, ease: 'easeOut' }
}

export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: 'easeOut' }
}

// Animations de scale
export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
  transition: { duration: 0.3, ease: 'easeOut' }
}

export const scaleInBounce = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  },
  exit: { scale: 0, opacity: 0 }
}

// Animations glass morphism
export const glassAppear = {
  initial: { 
    opacity: 0, 
    backdropFilter: 'blur(0px)',
    WebkitBackdropFilter: 'blur(0px)'
  },
  animate: { 
    opacity: 1, 
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    backdropFilter: 'blur(0px)',
    WebkitBackdropFilter: 'blur(0px)',
    transition: { duration: 0.3 }
  }
}

// Animation de shimmer pour les loading states
export const shimmer = {
  initial: { backgroundPosition: '-200% 0' },
  animate: { 
    backgroundPosition: '200% 0',
    transition: { 
      duration: 1.5, 
      ease: 'linear', 
      repeat: Infinity 
    }
  }
}

// Animations de conteneur avec enfants décalés
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { opacity: 0, y: -20 }
}

// Animations de rotation
export const rotate180 = {
  initial: { rotate: 0 },
  animate: { rotate: 180 },
  transition: { duration: 0.3 }
}

export const rotate360 = {
  animate: { 
    rotate: 360,
    transition: { 
      duration: 2, 
      ease: 'linear', 
      repeat: Infinity 
    }
  }
}

// Animation de pulse pour attirer l'attention
export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity
    }
  }
}

// Animation de shake pour les erreurs
export const shake = {
  animate: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut'
    }
  }
}

// Animations de hover
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: 'spring', stiffness: 400, damping: 17 }
}

export const hoverGlow = {
  whileHover: { 
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
    transition: { duration: 0.3 }
  }
}

// Animation de skeleton loading
export const skeleton = {
  initial: { opacity: 0.5 },
  animate: { 
    opacity: [0.5, 1, 0.5],
    transition: { 
      duration: 1.5, 
      ease: 'easeInOut', 
      repeat: Infinity 
    }
  }
}

// Animations de page transition
export const pageTransition = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
  transition: { duration: 0.4, ease: 'easeInOut' }
}

// Animation de modal
export const modalOverlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
}

export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  exit: { opacity: 0, scale: 0.95, y: 20 }
}

// Animation de sidebar
export const sidebarSlide = {
  initial: { x: -300 },
  animate: { x: 0 },
  exit: { x: -300 },
  transition: { type: 'spring', stiffness: 300, damping: 30 }
}

// Animation de notification
export const notificationSlide = {
  initial: { x: 400, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 400, opacity: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 30 }
}