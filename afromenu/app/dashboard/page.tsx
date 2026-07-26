'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ProtectedRoute from '@/components/ProtectedRoute'
import LogoLoadingScreen from '@/components/LogoLoadingScreen'
import { supabase } from '@/lib/supabase'

function DashboardContent() {
  const router = useRouter()
  const [establishments, setEstablishments] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 5) return 'Late night grind'
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    if (h < 21) return 'Good evening'
    return 'Good night'
  }

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user: u } } = await supabase.auth.getUser()
        setUser(u)

        const res = await fetch('/api/establishments/mine', {
          credentials: 'include',
          cache: 'no-store',
        })
        if (res.ok) {
          const data = await res.json()
          setEstablishments(data.establishments || [])
        }
      } catch {
        setEstablishments([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LogoLoadingScreen message="Loading your restaurants..." />

  const name = user?.user_metadata?.name ||
               user?.email?.split('@')[0] || 'Chef'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#050507',
      color: 'white',
      fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
      overflowX: 'hidden',
    }}>

      {/* ── BACKGROUND EFFECTS ── */}
      <div style={{
        position: 'fixed', top: -100, right: -100,
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(218,192,99,0.08) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: -50, left: -50,
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(218,192,99,0.05) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(218,192,99,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(218,192,99,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }} />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        height: 64,
        background: 'rgba(5,5,7,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(218,192,99,0.08)',
      }}>
        <Image
          src="/logo.png"
          alt="Afromenu"
          width={120}
          height={34}
          style={{ height: 30, width: 'auto', filter: 'brightness(0) invert(1)' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            {user?.email}
          </div>
          <div
            title="Sign out"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(218,192,99,0.3), rgba(218,192,99,0.1))',
              border: '1.5px solid rgba(218,192,99,0.4)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#dac063',
              fontSize: 14, fontWeight: 800, cursor: 'pointer',
            }}
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/login')
            }}
          >
            {name[0]?.toUpperCase()}
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ── */}
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 900, margin: '0 auto',
        padding: '48px 24px 80px',
      }}>

        {/* ── HERO GREETING ── */}
        <div style={{ marginBottom: 52 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(218,192,99,0.08)',
            border: '1px solid rgba(218,192,99,0.2)',
            borderRadius: 99, padding: '5px 14px',
            marginBottom: 20,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#dac063',
              animation: 'blink 2s infinite',
            }} />
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#dac063',
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              Partner Dashboard
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 52px)',
            fontWeight: 900, margin: '0 0 12px',
            letterSpacing: '-0.04em', lineHeight: 1.1,
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {getGreeting()},<br />
            <span style={{
              background: 'linear-gradient(135deg, #dac063 0%, #f0d080 50%, #dac063 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {name}
            </span>
          </h1>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.35)',
            margin: 0, fontWeight: 400,
          }}>
            Your digital menus are live and ready for customers.
          </p>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12, marginBottom: 52,
        }}>
          {[
            { value: establishments.length.toString(), label: 'Active Menus', icon: '◈', color: '#dac063' },
            { value: '∞', label: 'Menu Items', icon: '◉', color: '#a78bfa' },
            { value: '✦', label: 'QR Scans', icon: '◎', color: '#34d399' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20, padding: '20px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -20, right: -20,
                width: 80, height: 80, borderRadius: '50%',
                background: `radial-gradient(circle, ${stat.color}25, transparent 70%)`,
              }} />
              <div style={{ fontSize: 24, color: stat.color, marginBottom: 8, fontWeight: 900 }}>
                {stat.icon}
              </div>
              <div style={{
                fontSize: 28, fontWeight: 900,
                color: 'white', letterSpacing: '-0.03em', marginBottom: 4,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 11, color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── RESTAURANTS SECTION ── */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 99,
                background: 'linear-gradient(180deg, #dac063, transparent)',
              }} />
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Your Restaurants
              </h2>
              <div style={{
                background: 'rgba(218,192,99,0.1)',
                border: '1px solid rgba(218,192,99,0.25)',
                borderRadius: 99, padding: '2px 10px',
                color: '#dac063', fontSize: 12, fontWeight: 700,
              }}>
                {establishments.length}
              </div>
            </div>
            <button
              onClick={() => router.push('/onboarding?new=true')}
              style={{
                background: 'linear-gradient(135deg, #dac063, #f0d080)',
                border: 'none', borderRadius: 12,
                padding: '10px 20px', color: '#050507',
                fontSize: 13, fontWeight: 800,
                cursor: 'pointer', letterSpacing: '-0.01em',
              }}
            >
              + New Restaurant
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {establishments.map((est: any, index: number) => (
              <div
                key={est.id}
                onMouseEnter={() => setHoveredId(est.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  position: 'relative',
                  background: hoveredId === est.id
                    ? 'rgba(218,192,99,0.04)'
                    : 'rgba(255,255,255,0.02)',
                  border: hoveredId === est.id
                    ? '1px solid rgba(218,192,99,0.2)'
                    : '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 20,
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  transition: 'all 0.25s ease',
                  cursor: 'default',
                  overflow: 'hidden',
                }}
              >
                {/* Index number */}
                <div style={{
                  fontSize: 11, fontWeight: 700,
                  color: 'rgba(218,192,99,0.3)',
                  letterSpacing: '0.05em', flexShrink: 0,
                  width: 20, textAlign: 'center',
                }}>
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Logo */}
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  flexShrink: 0, overflow: 'hidden',
                  background: 'rgba(218,192,99,0.08)',
                  border: '1px solid rgba(218,192,99,0.15)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {est.logo_url ? (
                    <img src={est.logo_url} alt={est.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#dac063', fontSize: 22, fontWeight: 900 }}>
                      {est.name?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    marginBottom: 6, flexWrap: 'wrap',
                  }}>
                    <span style={{
                      fontSize: 17, fontWeight: 800,
                      color: 'white', letterSpacing: '-0.02em',
                    }}>
                      {est.name}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      color: '#34d399', textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      background: 'rgba(52,211,153,0.1)',
                      border: '1px solid rgba(52,211,153,0.2)',
                      borderRadius: 99, padding: '2px 8px',
                    }}>
                      Live
                    </span>
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.3)',
                    fontFamily: 'monospace',
                  }}>
                    afromenu.vercel.app/p/{est.slug}
                  </div>
                </div>

                {/* Style badge */}
                <div style={{
                  background: 'rgba(218,192,99,0.06)',
                  border: '1px solid rgba(218,192,99,0.12)',
                  borderRadius: 10, padding: '6px 12px',
                  flexShrink: 0,
                }}>
                  <div style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.3)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    marginBottom: 2,
                  }}>
                    Style
                  </div>
                  <div style={{ fontSize: 12, color: '#dac063', fontWeight: 700 }}>
                    Luxury Dark
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => router.push(`/p/${est.slug}`)}
                    style={{
                      background: hoveredId === est.id
                        ? 'linear-gradient(135deg, #dac063, #f0d080)'
                        : 'rgba(218,192,99,0.1)',
                      border: '1px solid rgba(218,192,99,0.3)',
                      borderRadius: 12, padding: '10px 18px',
                      color: hoveredId === est.id ? '#050507' : '#dac063',
                      fontSize: 13, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.25s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Edit Menu
                  </button>
                  <button
                    onClick={() => router.push(`/panel/${est.slug}/qr-code`)}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12, padding: '10px 14px',
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: 13, cursor: 'pointer',
                      whiteSpace: 'nowrap', transition: 'all 0.25s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                    }}
                  >
                    📱 QR
                  </button>
                </div>
              </div>
            ))}

            {/* Add new */}
            <div
              onClick={() => router.push('/onboarding?new=true')}
              style={{
                border: '1px dashed rgba(218,192,99,0.15)',
                borderRadius: 20, padding: '24px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 16,
                cursor: 'pointer', marginTop: 8,
                transition: 'all 0.25s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(218,192,99,0.4)'
                ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(218,192,99,0.03)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(218,192,99,0.15)'
                ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                border: '1.5px dashed rgba(218,192,99,0.3)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'rgba(218,192,99,0.5)',
                fontSize: 22,
              }}>
                +
              </div>
              <div>
                <div style={{
                  fontSize: 14, fontWeight: 700,
                  color: 'rgba(255,255,255,0.5)', marginBottom: 2,
                }}>
                  Add Another Restaurant
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
                  Launch a new digital menu in minutes
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          marginTop: 60, paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Image src="/icon.png" alt="" width={16} height={16}
              style={{ opacity: 0.3, filter: 'invert(1)' }} />
            Afromenu Partner Platform
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)' }}>
            © 2026
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
          background: rgba(218,192,99,0.2);
          border-radius: 99px;
        }
      `}</style>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
