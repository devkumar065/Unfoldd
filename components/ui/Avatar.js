import Image from 'next/image'

export function Avatar({ src, fallback, className = "w-10 h-10" }) {
  return (
    <div className={`rounded-full bg-border overflow-hidden relative shrink-0 ${className}`}>
      {src ? (
        <Image 
          src={src} 
          alt="avatar" 
          fill 
          className="object-cover"
          onError={(e) => {
            // In a real app we might set a state to show fallback
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple to-cyan text-white font-bold text-sm uppercase">
          {fallback || 'U'}
        </div>
      )}
    </div>
  )
}
