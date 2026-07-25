'use client'
import { useParams, useRouter } from 'next/navigation'

const components = [
  {
    id: 'addons',
    icon: '✦',
    title: 'Add-ons',
    description: 'Create extras customers can add to items',
    subtitle: 'e.g. Extra cheese, Spicy sauce',
  },
  {
    id: 'visibility',
    icon: '◎',
    title: 'Items Visibility',
    description: 'Show or hide items without deleting',
    subtitle: 'Mark items as out of stock instantly',
  },
  {
    id: 'languages',
    icon: '❋',
    title: 'Languages',
    description: 'Add translations for your menu',
    subtitle: 'Reach more customers in their language',
  },
  {
    id: 'scheduled',
    icon: '◷',
    title: 'Scheduled Prices',
    description: 'Set price changes by date or time',
    subtitle: 'Happy hour, seasonal pricing',
  },
]

export default function ComponentsPage() {
  const { slug } = useParams()
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0b',
      color: 'white',
      maxWidth: 430,
      margin: '0 auto',
      position: 'relative',
    }}>
      
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10,10,11,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(218,192,99,0.15)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}>
        <button
          onClick={() => router.push(`/p/${slug}`)}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            width: 38,
            height: 38,
            color: 'white',
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ←
        </button>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.02em',
          }}>
            Components
          </h1>
          <p style={{
            margin: 0,
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
          }}>
            Enhance your menu
          </p>
        </div>
      </div>

      {/* Ambient glow */}
      <div style={{
        position: 'fixed',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 300,
        height: 300,
        background: 'radial-gradient(circle, rgba(218,192,99,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Component Cards */}
      <div style={{ padding: '24px 16px', paddingBottom: 100 }}>
        
        <p style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 600,
          marginBottom: 16,
        }}>
          Available Components
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {components.map((comp) => (
            <button
              key={comp.id}
              onClick={() => router.push(`/panel/${slug}/components/${comp.id}`)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 20,
                padding: '20px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                transition: 'all 0.2s ease',
                width: '100%',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(218,192,99,0.06)'
                e.currentTarget.style.borderColor = 'rgba(218,192,99,0.25)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
              }}
            >
              {/* Icon */}
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: 'rgba(218,192,99,0.08)',
                border: '1px solid rgba(218,192,99,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                color: '#dac063',
                flexShrink: 0,
              }}>
                {comp.icon}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'white',
                  marginBottom: 4,
                  letterSpacing: '-0.01em',
                }}>
                  {comp.title}
                </div>
                <div style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.5)',
                  marginBottom: 2,
                }}>
                  {comp.description}
                </div>
                <div style={{
                  fontSize: 11,
                  color: 'rgba(218,192,99,0.6)',
                }}>
                  {comp.subtitle}
                </div>
              </div>

              {/* Arrow */}
              <div style={{
                color: 'rgba(218,192,99,0.4)',
                fontSize: 18,
                flexShrink: 0,
              }}>
                ›
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        background: 'rgba(10,10,11,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(218,192,99,0.12)',
        display: 'flex',
        zIndex: 999,
      }}>
        {[
          { label: 'Edit Menu', icon: '✏️', href: `/p/${slug}` },
          { label: 'Components', icon: '🧩', href: `/panel/${slug}/components`, active: true },
          { label: 'QR Code', icon: '📱', href: `/panel/${slug}/qr-code` },
          { label: 'More', icon: '⋯', href: `/panel/${slug}/settings` },
        ].map(tab => (
          <a key={tab.label} href={tab.href} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            padding: '10px 0',
            color: tab.active ? '#dac063' : 'rgba(255,255,255,0.35)',
            fontSize: 10,
            fontWeight: tab.active ? 700 : 400,
            textDecoration: 'none',
          }}>
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            {tab.label}
          </a>
        ))}
      </nav>
    </div>
  )
}
