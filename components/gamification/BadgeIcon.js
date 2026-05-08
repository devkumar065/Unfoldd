// Beautiful SVG badge icons — no emojis
// Each badge is a unique geometric art piece

import { motion } from 'framer-motion'

// Badge definitions with SVG art
const BADGE_DESIGNS = {
  first_mission: {
    label: 'First Mission',
    description: 'Completed your first mission',
    colors: { primary: '#6C63FF', secondary: '#00D4FF' },
    Icon: ({ size = 48 }) => (
      <svg width={size} height={size} viewBox="0 0 48 48"
        fill="none">
        <circle cx="24" cy="24" r="20" 
          fill="url(#fm1)" opacity="0.15" />
        <circle cx="24" cy="24" r="16" 
          stroke="url(#fm1)" strokeWidth="1.5" 
          fill="none" />
        <path d="M24 12 L27 21 L37 21 L29 27 L32 37 
          L24 31 L16 37 L19 27 L11 21 L21 21 Z"
          fill="url(#fm1)" />
        <defs>
          <linearGradient id="fm1" x1="0" y1="0" 
            x2="48" y2="48">
            <stop stopColor="#6C63FF" />
            <stop offset="1" stopColor="#00D4FF" />
          </linearGradient>
        </defs>
      </svg>
    )
  },

  first_verified: {
    label: 'First Verified',
    description: 'Got your first skill verified',
    colors: { primary: '#00F5A0', secondary: '#00D4FF' },
    Icon: ({ size = 48 }) => (
      <svg width={size} height={size} viewBox="0 0 48 48"
        fill="none">
        <path d="M24 4 L44 14 L44 26 C44 36 35 43 24 46 
          C13 43 4 36 4 26 L4 14 Z"
          fill="url(#fv1)" opacity="0.15" />
        <path d="M24 4 L44 14 L44 26 C44 36 35 43 24 46 
          C13 43 4 36 4 26 L4 14 Z"
          stroke="url(#fv1)" strokeWidth="1.5" 
          fill="none" />
        <path d="M15 24 L21 30 L33 18"
          stroke="url(#fv1)" strokeWidth="3"
          strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="fv1" x1="0" y1="0" 
            x2="48" y2="48">
            <stop stopColor="#00F5A0" />
            <stop offset="1" stopColor="#00D4FF" />
          </linearGradient>
        </defs>
      </svg>
    )
  },

  streak_7: {
    label: 'Week Warrior',
    description: '7-day streak achieved',
    colors: { primary: '#FF6B35', secondary: '#FFB800' },
    Icon: ({ size = 48 }) => (
      <svg width={size} height={size} viewBox="0 0 48 48"
        fill="none">
        {/* Flame shape */}
        <path d="M24 6 C24 6 32 14 32 22 C32 26 30 28 28 28 
          C30 24 28 20 24 18 C24 18 26 26 22 30 
          C20 32 18 32 16 30 C14 28 14 24 16 22
          C18 20 20 18 20 14 C16 18 14 22 14 26 
          C14 30 16 34 20 36 C22 37 24 38 24 38 
          C24 38 34 36 36 28 C38 20 30 10 24 6 Z"
          fill="url(#s71)" />
        <path d="M24 28 C24 28 28 26 28 22 
          C26 24 24 28 24 28 Z"
          fill="white" opacity="0.3" />
        <defs>
          <linearGradient id="s71" x1="14" y1="6" 
            x2="36" y2="38">
            <stop stopColor="#FFB800" />
            <stop offset="1" stopColor="#FF6B35" />
          </linearGradient>
        </defs>
      </svg>
    )
  },

  streak_30: {
    label: 'Month Master',
    description: '30-day streak achieved',
    colors: { primary: '#FF4444', secondary: '#FF6B35' },
    Icon: ({ size = 48 }) => (
      <svg width={size} height={size} viewBox="0 0 48 48"
        fill="none">
        {/* Double flame */}
        <path d="M18 8 C18 8 24 16 22 24 
          C20 28 18 28 18 28 C18 28 22 22 20 18
          C18 22 16 26 16 30 C16 34 18 38 22 40
          C14 38 10 32 10 26 C10 18 18 8 18 8 Z"
          fill="url(#s301)" opacity="0.8" />
        <path d="M24 6 C24 6 32 14 32 22 C32 28 28 32 24 34
          C28 30 28 26 26 22 C24 26 22 30 22 34
          C18 32 16 28 18 24 C20 18 24 6 24 6 Z"
          fill="url(#s302)" />
        <defs>
          <linearGradient id="s301" x1="0" y1="0"
            x2="48" y2="48">
            <stop stopColor="#FFB800" />
            <stop offset="1" stopColor="#FF6B35" />
          </linearGradient>
          <linearGradient id="s302" x1="0" y1="0"
            x2="48" y2="48">
            <stop stopColor="#FF6B35" />
            <stop offset="1" stopColor="#FF4444" />
          </linearGradient>
        </defs>
      </svg>
    )
  },

  streak_60: {
    label: 'Consistency King',
    description: '60-day streak achieved',
    colors: { primary: '#6C63FF', secondary: '#FF4444' },
    Icon: ({ size = 48 }) => (
      <svg width={size} height={size} viewBox="0 0 48 48"
        fill="none">
        {/* Crown */}
        <path d="M8 36 L12 20 L20 30 L24 14 L28 30 
          L36 20 L40 36 Z"
          fill="url(#ck1)" />
        <rect x="8" y="36" width="32" height="6"
          rx="3" fill="url(#ck1)" />
        <circle cx="24" cy="14" r="3" 
          fill="#FFD700" />
        <circle cx="12" cy="20" r="2.5" 
          fill="#FFD700" />
        <circle cx="36" cy="20" r="2.5" 
          fill="#FFD700" />
        <defs>
          <linearGradient id="ck1" x1="0" y1="0"
            x2="48" y2="48">
            <stop stopColor="#6C63FF" />
            <stop offset="1" stopColor="#FF4444" />
          </linearGradient>
        </defs>
      </svg>
    )
  },

  streak_90: {
    label: 'Journey Complete',
    description: '90-day streak achieved',
    colors: { primary: '#FFD700', secondary: '#FF6B35' },
    Icon: ({ size = 48 }) => (
      <svg width={size} height={size} viewBox="0 0 48 48"
        fill="none">
        {/* Trophy */}
        <path d="M14 8 L34 8 L34 22 C34 30 29 35 24 36 
          C19 35 14 30 14 22 Z"
          fill="url(#jc1)" />
        <path d="M8 8 L14 8 L14 18 C12 16 8 14 8 10 Z"
          fill="url(#jc1)" opacity="0.6" />
        <path d="M40 8 L34 8 L34 18 C36 16 40 14 40 10 Z"
          fill="url(#jc1)" opacity="0.6" />
        <rect x="20" y="36" width="8" height="6"
          fill="url(#jc1)" />
        <rect x="14" y="42" width="20" height="4"
          rx="2" fill="url(#jc1)" />
        <path d="M24 16 L25.5 21 L31 21 L26.5 24 
          L28 29 L24 26 L20 29 L21.5 24 L17 21 
          L22.5 21 Z"
          fill="white" opacity="0.9" />
        <defs>
          <linearGradient id="jc1" x1="0" y1="0"
            x2="48" y2="48">
            <stop stopColor="#FFD700" />
            <stop offset="1" stopColor="#FF6B35" />
          </linearGradient>
        </defs>
      </svg>
    )
  },

  first_application: {
    label: 'Job Hunter',
    description: 'First internship applied',
    colors: { primary: '#00D4FF', secondary: '#6C63FF' },
    Icon: ({ size = 48 }) => (
      <svg width={size} height={size} viewBox="0 0 48 48"
        fill="none">
        {/* Send/arrow icon */}
        <circle cx="24" cy="24" r="20" 
          fill="url(#fa1)" opacity="0.1" />
        <circle cx="24" cy="24" r="16" 
          stroke="url(#fa1)" strokeWidth="1.5" 
          fill="none" />
        <path d="M14 24 L32 16 L26 24 L32 32 Z"
          fill="url(#fa1)" />
        <path d="M22 24 L32 16"
          stroke="white" strokeWidth="1.5"
          strokeLinecap="round" opacity="0.5" />
        <defs>
          <linearGradient id="fa1" x1="0" y1="0"
            x2="48" y2="48">
            <stop stopColor="#00D4FF" />
            <stop offset="1" stopColor="#6C63FF" />
          </linearGradient>
        </defs>
      </svg>
    )
  },

  top_learner: {
    label: 'Top Learner',
    description: '10 skills learned',
    colors: { primary: '#00F5A0', secondary: '#6C63FF' },
    Icon: ({ size = 48 }) => (
      <svg width={size} height={size} viewBox="0 0 48 48"
        fill="none">
        {/* Brain/lightbulb hybrid */}
        <circle cx="24" cy="20" r="12" 
          stroke="url(#tl1)" strokeWidth="2"
          fill="url(#tl1)" opacity="0.15" />
        <path d="M20 20 C20 16 22 14 24 14 C26 14 28 16 28 20"
          stroke="url(#tl1)" strokeWidth="2"
          fill="none" strokeLinecap="round" />
        <line x1="24" y1="32" x2="24" y2="36"
          stroke="url(#tl1)" strokeWidth="2"
          strokeLinecap="round" />
        <path d="M20 32 L28 32" stroke="url(#tl1)" 
          strokeWidth="2" strokeLinecap="round" />
        <path d="M21 36 L27 36" stroke="url(#tl1)" 
          strokeWidth="2" strokeLinecap="round" />
        {/* Sparkles */}
        <circle cx="10" cy="12" r="2" fill="url(#tl1)" 
          opacity="0.6" />
        <circle cx="38" cy="12" r="2" fill="url(#tl1)" 
          opacity="0.6" />
        <circle cx="10" cy="28" r="1.5" fill="url(#tl1)" 
          opacity="0.4" />
        <circle cx="38" cy="28" r="1.5" fill="url(#tl1)" 
          opacity="0.4" />
        <defs>
          <linearGradient id="tl1" x1="0" y1="0"
            x2="48" y2="48">
            <stop stopColor="#00F5A0" />
            <stop offset="1" stopColor="#6C63FF" />
          </linearGradient>
        </defs>
      </svg>
    )
  },

  early_adopter: {
    label: 'Early Adopter',
    description: 'Joined in first 1000 users',
    colors: { primary: '#FFD700', secondary: '#6C63FF' },
    Icon: ({ size = 48 }) => (
      <svg width={size} height={size} viewBox="0 0 48 48"
        fill="none">
        {/* Rocket */}
        <path d="M24 6 C24 6 34 12 34 24 L34 36 
          L24 32 L14 36 L14 24 C14 12 24 6 24 6 Z"
          fill="url(#ea1)" />
        <ellipse cx="24" cy="24" rx="5" ry="7"
          fill="white" opacity="0.3" />
        <path d="M18 34 L12 40" stroke="url(#ea1)" 
          strokeWidth="3" strokeLinecap="round" />
        <path d="M30 34 L36 40" stroke="url(#ea1)" 
          strokeWidth="3" strokeLinecap="round" />
        <circle cx="24" cy="22" r="3" 
          fill="white" opacity="0.8" />
        <defs>
          <linearGradient id="ea1" x1="0" y1="0"
            x2="48" y2="48">
            <stop stopColor="#FFD700" />
            <stop offset="1" stopColor="#6C63FF" />
          </linearGradient>
        </defs>
      </svg>
    )
  }
}

// Main badge component with animation
export default function BadgeIcon({ 
  badgeType, 
  earned = false,
  size = 48,
  showLabel = true,
  animate = true
}) {
  const badge = BADGE_DESIGNS[badgeType] || 
    BADGE_DESIGNS.first_mission
  const Icon = badge.Icon

  return (
    <motion.div
      whileHover={animate && earned 
        ? { scale: 1.1, rotate: 3 } 
        : {}}
      transition={{ type: 'spring', 
        stiffness: 400, damping: 20 }}
      className="flex flex-col items-center gap-2"
    >
      {/* Badge icon */}
      <div className="relative">
        {/* Glow behind earned badge */}
        {earned && (
          <motion.div
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 rounded-full
              blur-md -z-10"
            style={{ 
              background: badge.colors.primary,
              opacity: 0.3
            }}
          />
        )}

        {/* Icon with earned/locked state */}
        <div className={`transition-all duration-300
          ${!earned ? 'grayscale opacity-30' : ''}`}>
          <Icon size={size} />
        </div>

        {/* Lock overlay for unearned */}
        {!earned && (
          <div className="absolute inset-0 flex 
            items-center justify-center">
            <div className="bg-[#0A0A0F]/80 rounded-full
              p-1.5">
              {/* Lock icon using SVG */}
              <svg width="14" height="14" 
                viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="2.5"
                strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11"
                  rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <div className="text-center">
          <p className={`text-xs font-semibold
            ${earned ? 'text-white' : 'text-white/30'}`}>
            {badge.label}
          </p>
          {earned && (
            <p className="text-white/30 text-[10px]">
              {badge.description}
            </p>
          )}
        </div>
      )}
    </motion.div>
  )
}

// Export badge config for use elsewhere
export { BADGE_DESIGNS }
