'use client'
import Image from 'next/image'

export default function LogoLoadingScreen({ 
  message = 'Loading...' 
}: { message?: string }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0b',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(218,192,99,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo with pulse animation */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Outer ring pulse */}
        <div style={{
          position: 'absolute',
          width: 90, height: 90,
          borderRadius: '50%',
          border: '1px solid rgba(218,192,99,0.2)',
          animation: 'pulse-ring 2s ease-out infinite',
        }} />
        {/* Inner ring */}
        <div style={{
          position: 'absolute',
          width: 70, height: 70,
          borderRadius: '50%',
          border: '1px solid rgba(218,192,99,0.15)',
          animation: 'pulse-ring 2s ease-out infinite 0.5s',
        }} />
        
        {/* Logo circle */}
        <div style={{
          width: 56, height: 56,
          borderRadius: '50%',
          background: 'rgba(218,192,99,0.08)',
          border: '1.5px solid rgba(218,192,99,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <Image
            src="/icon.png"
            alt="Afromenu"
            width={36}
            height={36}
            style={{ 
              width: 36, 
              height: 36, 
              objectFit: 'contain',
              filter: 'brightness(0) invert(1)',
            }}
          />
        </div>
      </div>

      {/* Loading bar */}
      <div style={{
        width: 120, height: 2,
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 99, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, transparent, #dac063, transparent)',
          animation: 'loading-bar 1.5s ease-in-out infinite',
          borderRadius: 99,
        }} />
      </div>

      {/* Message */}
      <p style={{
        color: 'rgba(255,255,255,0.3)',
        fontSize: 13,
        margin: 0,
        letterSpacing: '0.02em',
      }}>
        {message}
      </p>

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes loading-bar {
          0% { transform: translateX(-100%); width: 100%; }
          50% { transform: translateX(0%); width: 100%; }
          100% { transform: translateX(100%); width: 100%; }
        }
      `}</style>
    </div>
  )
}
