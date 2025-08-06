// Configurations de transitions réutilisables

// Transitions de base
export const transitions = {
  // Transition rapide
  fast: {
    duration: 0.15,
    ease: 'easeOut'
  },
  
  // Transition normale
  normal: {
    duration: 0.3,
    ease: 'easeOut'
  },
  
  // Transition lente
  slow: {
    duration: 0.5,
    ease: 'easeOut'
  },
  
  // Transition très lente
  verySlow: {
    duration: 1,
    ease: 'easeOut'
  }
}

// Transitions avec spring
export const springTransitions = {
  // Spring serré (rapide)
  tight: {
    type: 'spring',
    stiffness: 400,
    damping: 30
  },
  
  // Spring normal
  normal: {
    type: 'spring',
    stiffness: 300,
    damping: 20
  },
  
  // Spring lâche (rebondissant)
  loose: {
    type: 'spring',
    stiffness: 200,
    damping: 15
  },
  
  // Spring très lâche
  veryLoose: {
    type: 'spring',
    stiffness: 100,
    damping: 10
  }
}

// Courbes d'accélération personnalisées
export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  sharp: [0.4, 0, 0.6, 1],
  bounce: [0.68, -0.55, 0.265, 1.55]
}

// Durées standards en secondes
export const durations = {
  instant: 0,
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  verySlow: 1,
  
  // Durées spécifiques
  ripple: 0.6,
  complex: 0.8,
  page: 0.4,
  modal: 0.3,
  tooltip: 0.2,
  skeleton: 1.5
}

// Délais standards
export const delays = {
  none: 0,
  short: 0.1,
  medium: 0.2,
  long: 0.3,
  veryLong: 0.5
}

// Configurations de stagger
export const staggerConfigs = {
  fast: {
    staggerChildren: 0.05,
    delayChildren: 0
  },
  
  normal: {
    staggerChildren: 0.1,
    delayChildren: 0.2
  },
  
  slow: {
    staggerChildren: 0.15,
    delayChildren: 0.3
  },
  
  cascade: {
    staggerChildren: 0.1,
    delayChildren: 0,
    staggerDirection: 1
  },
  
  reversCascade: {
    staggerChildren: 0.1,
    delayChildren: 0,
    staggerDirection: -1
  }
}

// Transitions pour les états de hover
export const hoverTransitions = {
  scale: {
    type: 'spring',
    stiffness: 400,
    damping: 17
  },
  
  color: {
    duration: 0.2,
    ease: 'easeOut'
  },
  
  shadow: {
    duration: 0.3,
    ease: 'easeOut'
  },
  
  all: {
    duration: 0.3,
    ease: 'easeOut'
  }
}

// Transitions pour les glassmorphism effects
export const glassTransitions = {
  blur: {
    duration: 0.5,
    ease: 'easeOut'
  },
  
  opacity: {
    duration: 0.3,
    ease: 'easeOut'
  },
  
  all: {
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1]
  }
}

// Fonction helper pour créer des transitions personnalisées
export const createTransition = (properties = ['all'], options = {}) => {
  const {
    duration = durations.normal,
    ease = 'easeOut',
    delay = 0
  } = options
  
  return {
    transitionProperty: properties.join(', '),
    transitionDuration: `${duration}s`,
    transitionTimingFunction: Array.isArray(ease) ? `cubic-bezier(${ease.join(', ')})` : ease,
    transitionDelay: `${delay}s`
  }
}

// Presets de transitions complexes
export const transitionPresets = {
  // Transition de page
  page: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: durations.page, ease: easings.easeInOut }
  },
  
  // Transition de modal
  modal: {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: durations.modal }
    },
    content: {
      initial: { opacity: 0, scale: 0.95, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: 20 },
      transition: springTransitions.normal
    }
  },
  
  // Transition de collapse
  collapse: {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { duration: durations.normal, ease: easings.easeOut }
  },
  
  // Transition de fade
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: durations.normal }
  }
}