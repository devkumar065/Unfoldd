// CENTRAL ANIMATION CONFIG
// Import from here — never define inline

// ── REDUCED MOTION DETECTION ─────────────────
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(
    '(prefers-reduced-motion: reduce)').matches
}

// ── FAST TRANSITION PRESETS ──────────────────
// Use these instead of defining per-component

export const transitions = {
  // Snappy UI interactions
  fast: { 
    duration: 0.15, 
    ease: [0.4, 0, 0.2, 1] 
  },
  
  // Standard page elements
  normal: { 
    duration: 0.25, 
    ease: [0.4, 0, 0.2, 1] 
  },
  
  // Hero/entrance animations
  smooth: { 
    duration: 0.4, 
    ease: [0.16, 1, 0.3, 1] 
  },
  
  // Spring for interactive elements
  spring: { 
    type: 'spring', 
    stiffness: 400,  // Higher = snappier
    damping: 30,
    mass: 0.8
  },
  
  // Gentle spring for cards
  springGentle: {
    type: 'spring',
    stiffness: 250,
    damping: 25,
    mass: 1
  }
}

// ── ANIMATION VARIANTS ────────────────────────
// Pre-defined — don't recreate on every render

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: transitions.normal
}

export const slideUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: transitions.smooth
}

export const slideRight = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
  transition: transitions.smooth
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: transitions.spring
}

// Stagger container
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05
    }
  }
}

// Stagger item (use with staggerContainer)
export const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: transitions.smooth
  }
}

// Card hover (use whileHover — no variant needed)
export const cardHover = {
  scale: 1.02,
  y: -2,
  transition: transitions.fast
}

export const buttonTap = {
  scale: 0.97,
  transition: transitions.fast
}

// Page transition
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { 
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1]
  }
}
