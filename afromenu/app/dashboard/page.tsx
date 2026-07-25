'use client'

import React, { useEffect, useState } from 'react'
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

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const fetchData = async () => {
    try {
      // Load user
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)

      // Load establishments
      const res = await fetch('/api/establishments/mine', { 
        credentials: 'include',
        cache: 'no-store' 
      })
      if (res.ok) {
        const data = await res.json()
        setEstablishments(data.establishments || [])
      } else {
        setEstablishments([])
      }
    } catch (err) {
      console.error('Dashboard error:', err)
      setEstablishments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <LogoLoadingScreen message="Loading your restaurants..." />
  }

  const userName = user?.user_metadata?.name || 
                   user?.email?.split('@')[0] || 
                   'Chef'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0b',
      color: 'white',
      fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
      position: 'relative',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: 400, height: 400, pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(218,192,99,0.05) 0%, transparent 70%)',
      }} />
      
      {/* Header */}
      <div style={{
        background: '#0f0f14',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <Image
          src="/logo.png"
          alt="Afromenu"
          width={110}
          height={32}
          priority
          style={{ height: 32, width: 'auto', filter: 'brightness(0) invert(1)' }}
        />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'rgba(218,192,99,0.15)',
            border: '1.5px solid rgba(218,192,99,0.4)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#dac063',
            fontSize: 15, fontWeight: 700,
          }}>
            {userName[0]?.toUpperCase()}
          </div>
          <button
            onClick={handleSignOut}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 12, cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Gold line */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(218,192,99,0.4), transparent)',
      }} />

      <div style={{ padding: '28px 20px', maxWidth: 480, margin: '0 auto' }}>
        
        {/* Greeting */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize: 26, fontWeight: 800, margin: '0 0 6px',
            letterSpacing: '-0.03em',
          }}>
            {getGreeting()}, {userName} 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
            Your restaurants are performing well
          </p>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
          gap: 10, marginBottom: 32,
        }}>
          {[
            { label: 'Restaurants', value: establishments.length },
            { label: 'Menu Items', value: '—' },
            { label: 'QR Scans', value: 'Soon' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'rgba(218,192,99,0.04)',
              border: '1px solid rgba(218,192,99,0.1)',
              borderRadius: 14, padding: '14px 12px',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: 22, fontWeight: 800,
                color: '#dac063', marginBottom: 4,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 10, color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                fontWeight: 600,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Section title */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>
              My Restaurants
            </h2>
            <span style={{
              background: 'rgba(218,192,99,0.15)',
              border: '1px solid rgba(218,192,99,0.3)',
              borderRadius: 20, padding: '2px 8px',
              color: '#dac063', fontSize: 12, fontWeight: 700,
            }}>
              {establishments.length}
            </span>
          </div>
          <button
            onClick={() => router.push('/onboarding?new=true')}
            style={{
              background: '#dac063', border: 'none',
              borderRadius: 20, padding: '7px 16px',
              color: '#0a0a0b', fontSize: 13,
              fontWeight: 700, cursor: 'pointer',
            }}
          >
            + Add
          </button>
        </div>

        {/* Restaurant Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {establishments.map(est => (
            <div key={est.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20, padding: '14px 16px',
              display: 'flex', alignItems: 'center',
              gap: 14, position: 'relative', overflow: 'hidden',
              minHeight: 100,
            }}>
              {/* Gold accent strip */}
              <div style={{
                position: 'absolute', left: 0, top: 0,
                bottom: 0, width: 4,
                background: 'linear-gradient(180deg, #dac063, rgba(218,192,99,0.3))',
                borderRadius: '20px 0 0 20px',
              }} />

              {/* Logo */}
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: est.logo_url 
                  ? 'transparent' 
                  : `rgba(218,192,99,0.1)`,
                border: '1.5px solid rgba(218,192,99,0.3)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
                marginLeft: 8, overflow: 'hidden',
              }}>
                {est.logo_url ? (
                  <img src={est.logo_url} alt={est.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#dac063', fontSize: 22, fontWeight: 700 }}>
                    {est.name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 16, fontWeight: 700, color: 'white',
                  marginBottom: 4, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {est.name}
                </div>
                <div style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.4)',
                  marginBottom: 6, fontFamily: 'monospace',
                }}>
                  afromenu.com/p/{est.slug}
                </div>
                <span style={{
                  background: 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 20, padding: '2px 8px',
                  color: '#10b981', fontSize: 10, fontWeight: 600,
                  display: 'inline-block',
                }}>
                  ● Live
                </span>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex', flexDirection: 'column',
                gap: 6, flexShrink: 0,
              }}>
                <button
                  onClick={() => router.push(`/p/${est.slug}`)}
                  style={{
                    background: '#dac063', border: 'none',
                    borderRadius: 10, padding: '8px 14px',
                    color: '#0a0a0b', fontSize: 12,
                    fontWeight: 700, cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Edit Menu →
                </button>
                <button
                  onClick={() => router.push(`/panel/${est.slug}/qr-code`)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, padding: '6px 14px',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: 11, cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  QR Code
                </button>
              </div>
            </div>
          ))}

          {/* Add New Card */}
          <button
            onClick={() => router.push('/onboarding?new=true')}
            style={{
              width: '100%', height: 80,
              background: 'transparent',
              border: '1.5px dashed rgba(218,192,99,0.2)',
              borderRadius: 20, cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 12,
              color: '#dac063',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#dac063'
              e.currentTarget.style.background = 'rgba(218,192,99,0.04)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(218,192,99,0.2)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '1.5px solid currentColor',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 18,
              fontWeight: 700,
            }}>+</div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              Add New Restaurant
            </span>
          </button>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center', marginTop: 40,
          color: 'rgba(255,255,255,0.15)', fontSize: 12,
        }}>
          Powered by Afromenu ✦
        </div>
      </div>
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
