// Lightweight motion wrapper
// Animates only when in viewport
'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

export function FadeIn({ 
  children, 
  delay = 0,
  className = '',
  once = true 
}) {
  const [visible, setVisible] = useState(false)
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: once
  })

  useEffect(() => {
    if (inView) setVisible(true)
  }, [inView])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible 
          ? 'translateY(0)' 
          : 'translateY(12px)',
        transition: `opacity 0.3s ease ${delay}ms, 
          transform 0.3s ease ${delay}ms`,
        willChange: visible ? 'auto' : 'transform'
      }}
    >
      {children}
    </div>
  )
}

// Stagger children
export function StaggerIn({ 
  children, 
  className = '',
  staggerMs = 60 
}) {
  const { ref, inView } = useInView({
    threshold: 0.05,
    triggerOnce: true
  })

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children) 
        ? children.map((child, i) => (
          <div
            key={i}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView 
                ? 'translateY(0)' 
                : 'translateY(12px)',
              transition: `opacity 0.3s ease ${
                i * staggerMs}ms, 
                transform 0.3s ease ${
                i * staggerMs}ms`,
            }}
          >
            {child}
          </div>
        ))
        : children
      }
    </div>
  )
}

// Use this instead of motion.div for most things
export function AnimatedCard({ 
  children, 
  className = '',
  onClick 
}) {
  return (
    <div
      className={`card-animate ${className}`}
      onClick={onClick}
      style={{
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 
          'translateY(-3px) translateZ(0)'
        e.currentTarget.style.boxShadow = 
          '0 12px 32px rgba(108,99,255,0.1)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 
          'translateY(0) translateZ(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {children}
    </div>
  )
}
