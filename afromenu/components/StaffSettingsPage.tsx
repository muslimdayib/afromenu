'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const DAYS = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
] as const

type DayName = typeof DAYS[number]

interface StaffMember {
  id: string
  email: string
  role: string
  invited_at: string
  accepted_at: string | null
  user_name?: string | null
}

interface HoursData {
  [key: string]: string | boolean | undefined
}

export default function StaffSettingsPage() {
  const { slug } = useParams()
  const router = useRouter()

  const [activeSection, setActiveSection] = useState<'team' | 'stock' | 'hours' | 'account'>('team')

  // Team state
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('editor')
  const [inviting, setInviting] = useState(false)

  // Stock state
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [stockLoading, setStockLoading] = useState(true)

  // Hours state
  const [hours, setHours] = useState<HoursData>({})
  const [hoursSaving, setHoursSaving] = useState(false)

  // Account state
  const [user, setUser] = useState<any>(null)

  const [establishment, setEstablishment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Load establishment data
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/establishments/by-slug/${slug}`)
        if (res.ok) {
          const data = await res.json()
          setEstablishment(data.establishment)
          setCategories(data.categories || [])
          setItems(data.items || [])
        }

        // Load current user
        const { data: { user: u } } = await supabase.auth.getUser()
        setUser(u)

        // Load staff
        const staffRes = await fetch(`/api/staff/${slug}`)
        if (staffRes.ok) {
          const staffData = await staffRes.json()
          setStaff(staffData.staff || [])
        }

        // Load operating hours
        const hoursRes = await fetch(`/api/operating-hours/${slug}`)
        if (hoursRes.ok) {
          const hoursData = await hoursRes.json()
          setHours(hoursData.hours || getDefaultHours())
        } else {
          setHours(getDefaultHours())
        }
      } catch (err) {
        console.error('Failed to load staff settings:', err)
      } finally {
        setLoading(false)
        setStockLoading(false)
      }
    }
    load()
  }, [slug])

  const getDefaultHours = (): HoursData => {
    const defaults: HoursData = {}
    DAYS.forEach(day => {
      defaults[`${day}_open`] = '09:00'
      defaults[`${day}_close`] = '22:00'
      defaults[`${day}_enabled`] = day !== 'sunday'
    })
    return defaults
  }

  // Invite staff member
  const handleInvite = async () => {
    if (!newEmail.trim()) return
    setInviting(true)
    try {
      const res = await fetch(`/api/staff/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim(), role: newRole }),
      })
      if (res.ok) {
        const data = await res.json()
        setStaff(prev => [...prev, data.member])
        setNewEmail('')
        showToast('Invitation sent!')
      } else {
        showToast('Failed to invite member')
      }
    } catch {
      showToast('Error inviting member')
    } finally {
      setInviting(false)
    }
  }

  // Remove staff member
  const handleRemoveStaff = async (memberId: string) => {
    if (!confirm('Remove this team member?')) return
    try {
      const res = await fetch(`/api/staff/${slug}?id=${memberId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setStaff(prev => prev.filter(s => s.id !== memberId))
        showToast('Member removed')
      }
    } catch {
      showToast('Failed to remove member')
    }
  }

  // Toggle item availability (out of stock)
  const handleToggleStock = async (itemId: string, currentAvailable: boolean) => {
    const nextVal = !currentAvailable
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, is_available: nextVal } : i))
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId, isAvailable: nextVal }),
      })
      if (!res.ok) throw new Error()
      showToast(nextVal ? 'Item back in stock' : 'Item marked out of stock')
    } catch {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, is_available: currentAvailable } : i))
      showToast('Failed to update')
    }
  }

  // Save operating hours
  const handleSaveHours = async () => {
    setHoursSaving(true)
    try {
      const res = await fetch(`/api/operating-hours/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hours),
      })
      if (res.ok) {
        showToast('Operating hours saved!')
      } else {
        showToast('Failed to save hours')
      }
    } catch {
      showToast('Error saving hours')
    } finally {
      setHoursSaving(false)
    }
  }

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const sectionBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 16px',
    background: active ? 'rgba(218,192,99,0.12)' : 'rgba(255,255,255,0.03)',
    border: active ? '1px solid rgba(218,192,99,0.3)' : '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    color: active ? '#dac063' : 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: active ? 700 : 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  })

  const labelStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 6,
    display: 'block',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '12px 14px',
    color: 'white',
    fontSize: 14,
    outline: 'none',
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0a0b',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 44, height: 44,
          border: '2px solid rgba(218,192,99,0.2)',
          borderTop: '2px solid #dac063',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Loading settings...</p>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0b',
      color: 'white',
      maxWidth: 430,
      margin: '0 auto',
      position: 'relative',
    }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(218,192,99,0.15)', border: '1px solid rgba(218,192,99,0.3)',
          borderRadius: 14, padding: '12px 20px', color: '#dac063',
          fontSize: 13, fontWeight: 600, zIndex: 9999,
          backdropFilter: 'blur(12px)',
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,11,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(218,192,99,0.15)',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <button
          onClick={() => router.push(`/p/${slug}`)}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, width: 38, height: 38,
            color: 'white', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >←</button>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
            Staff Settings
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            Team, stock & operations
          </p>
        </div>
      </div>

      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(218,192,99,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Section Tabs */}
      <div style={{
        display: 'flex', gap: 8, padding: '16px 16px 0',
        overflowX: 'auto',
      }}>
        <button onClick={() => setActiveSection('team')} style={sectionBtnStyle(activeSection === 'team')}>👥 Team</button>
        <button onClick={() => setActiveSection('stock')} style={sectionBtnStyle(activeSection === 'stock')}>📦 Stock</button>
        <button onClick={() => setActiveSection('hours')} style={sectionBtnStyle(activeSection === 'hours')}>🕐 Hours</button>
        <button onClick={() => setActiveSection('account')} style={sectionBtnStyle(activeSection === 'account')}>👤 Account</button>
      </div>

      <div style={{ padding: '20px 16px', paddingBottom: 100 }}>

        {/* ═══════════ SECTION 1: TEAM MEMBERS ═══════════ */}
        {activeSection === 'team' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Team Members
            </p>

            {/* Owner card */}
            {user && (
              <div style={{
                background: 'rgba(218,192,99,0.06)', border: '1px solid rgba(218,192,99,0.2)',
                borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(218,192,99,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: '#dac063', fontWeight: 700,
                }}>
                  {user.email?.[0]?.toUpperCase() || 'O'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>
                    {user.user_metadata?.name || user.email?.split('@')[0] || 'Owner'}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{user.email}</div>
                </div>
                <span style={{
                  background: 'rgba(218,192,99,0.15)', color: '#dac063',
                  padding: '4px 10px', borderRadius: 8, fontSize: 10,
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>Owner</span>
              </div>
            )}

            {/* Staff list */}
            {staff.map(member => (
              <div key={member.id} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: 'rgba(255,255,255,0.5)',
                }}>
                  {member.email[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>
                    {member.user_name || member.email.split('@')[0]}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{member.email}</div>
                </div>
                <span style={{
                  background: member.role === 'manager' ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.06)',
                  color: member.role === 'manager' ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                  padding: '4px 10px', borderRadius: 8, fontSize: 10,
                  fontWeight: 700, textTransform: 'uppercase',
                }}>{member.role}</span>
                <button
                  onClick={() => handleRemoveStaff(member.id)}
                  style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, width: 32, height: 32,
                    color: '#ef4444', fontSize: 14, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >✕</button>
              </div>
            ))}

            {/* Invite form */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20, padding: 20,
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 12 }}>
                Add Team Member
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="team@email.com"
                  style={inputStyle}
                />
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                  style={{ ...inputStyle, background: '#13131a', cursor: 'pointer' }}
                >
                  <option value="editor">Editor – Can edit menu items</option>
                  <option value="manager">Manager – Full access</option>
                </select>
                <button
                  onClick={handleInvite}
                  disabled={inviting || !newEmail.trim()}
                  style={{
                    width: '100%', padding: 14,
                    background: inviting || !newEmail.trim() ? 'rgba(255,255,255,0.05)' : '#dac063',
                    border: 'none', borderRadius: 14,
                    color: inviting || !newEmail.trim() ? 'rgba(255,255,255,0.3)' : '#0a0a0b',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  {inviting ? 'Sending Invite...' : '+ Send Invitation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ SECTION 2: OUT OF STOCK ═══════════ */}
        {activeSection === 'stock' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Item Availability
            </p>

            {categories.map(cat => {
              const catItems = items.filter(i => i.category_id === cat.id)
              if (catItems.length === 0) return null
              return (
                <div key={cat.id}>
                  <p style={{
                    fontSize: 11, color: '#dac063', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    marginBottom: 8, paddingBottom: 6,
                    borderBottom: '1px solid rgba(218,192,99,0.1)',
                  }}>{cat.name}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {catItems.map(item => {
                      const isAvailable = item.is_available !== false
                      return (
                        <div key={item.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: 14, padding: '12px 16px',
                          opacity: isAvailable ? 1 : 0.5,
                        }}>
                          <div>
                            <div style={{
                              fontSize: 14, fontWeight: 600, color: 'white',
                              textDecoration: isAvailable ? 'none' : 'line-through',
                            }}>{item.name}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                              {Number(item.price).toFixed(2)} {establishment?.currency_symbol || '$'}
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleStock(item.id, isAvailable)}
                            style={{
                              width: 48, height: 28, borderRadius: 14,
                              background: isAvailable ? '#22c55e' : 'rgba(255,255,255,0.1)',
                              border: 'none', cursor: 'pointer',
                              position: 'relative', transition: 'background 0.2s',
                              flexShrink: 0,
                            }}
                          >
                            <div style={{
                              width: 22, height: 22, borderRadius: '50%',
                              background: 'white', position: 'absolute',
                              top: 3, transition: 'left 0.2s',
                              left: isAvailable ? 23 : 3,
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                            }} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ═══════════ SECTION 3: OPERATING HOURS ═══════════ */}
        {activeSection === 'hours' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Operating Hours
            </p>

            {DAYS.map(day => {
              const enabled = hours[`${day}_enabled`] !== false
              return (
                <div key={day} style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16, padding: '14px 16px',
                  opacity: enabled ? 1 : 0.45,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: enabled ? 10 : 0 }}>
                    <span style={{
                      fontSize: 14, fontWeight: 700, color: 'white',
                      textTransform: 'capitalize',
                    }}>{day}</span>
                    <button
                      onClick={() => setHours(prev => ({ ...prev, [`${day}_enabled`]: !enabled }))}
                      style={{
                        width: 48, height: 28, borderRadius: 14,
                        background: enabled ? '#22c55e' : 'rgba(255,255,255,0.1)',
                        border: 'none', cursor: 'pointer',
                        position: 'relative', transition: 'background 0.2s',
                      }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'white', position: 'absolute',
                        top: 3, left: enabled ? 23 : 3,
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      }} />
                    </button>
                  </div>

                  {enabled && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Open</label>
                        <input
                          type="time"
                          value={(hours[`${day}_open`] as string) || '09:00'}
                          onChange={e => setHours(prev => ({ ...prev, [`${day}_open`]: e.target.value }))}
                          style={{ ...inputStyle, padding: '10px 12px', fontSize: 13 }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Close</label>
                        <input
                          type="time"
                          value={(hours[`${day}_close`] as string) || '22:00'}
                          onChange={e => setHours(prev => ({ ...prev, [`${day}_close`]: e.target.value }))}
                          style={{ ...inputStyle, padding: '10px 12px', fontSize: 13 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            <button
              onClick={handleSaveHours}
              disabled={hoursSaving}
              style={{
                width: '100%', padding: 16,
                background: hoursSaving ? 'rgba(255,255,255,0.05)' : '#dac063',
                border: 'none', borderRadius: 16,
                color: hoursSaving ? 'rgba(255,255,255,0.3)' : '#0a0a0b',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                marginTop: 8,
              }}
            >
              {hoursSaving ? 'Saving...' : '💾 Save Operating Hours'}
            </button>
          </div>
        )}

        {/* ═══════════ SECTION 4: ACCOUNT ═══════════ */}
        {activeSection === 'account' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Account Settings
            </p>

            {user && (
              <div style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20, padding: 24,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: 'rgba(218,192,99,0.1)', border: '1px solid rgba(218,192,99,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, color: '#dac063', fontWeight: 700,
                  }}>
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>
                      {user.user_metadata?.name || 'Account Owner'}
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{user.email}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Email</span>
                    <span style={{ color: 'white', fontWeight: 600 }}>{user.email}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Provider</span>
                    <span style={{ color: 'white', fontWeight: 600 }}>{user.app_metadata?.provider || 'email'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>Created</span>
                    <span style={{ color: 'white', fontWeight: 600 }}>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={async () => {
                const { error } = await supabase.auth.resetPasswordForEmail(user?.email || '', {
                  redirectTo: `${window.location.origin}/login`,
                })
                if (error) {
                  showToast('Failed to send reset email')
                } else {
                  showToast('Password reset email sent!')
                }
              }}
              style={{
                width: '100%', padding: 16,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, color: 'white',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              🔑 Change Password
            </button>

            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: 16,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 16, color: '#ef4444',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              🚪 Log Out
            </button>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: 'rgba(10,10,11,0.97)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(218,192,99,0.12)',
        display: 'flex', zIndex: 999,
      }}>
        {[
          { label: 'Edit Menu', icon: '✏️', href: `/p/${slug}` },
          { label: 'Components', icon: '🧩', href: `/panel/${slug}/components` },
          { label: 'QR Code', icon: '📱', href: `/panel/${slug}/qr-code` },
          { label: 'More', icon: '⋯', href: `/panel/${slug}/staff-settings`, active: true },
        ].map(tab => (
          <a key={tab.label} href={tab.href} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 4, padding: '10px 0',
            color: tab.active ? '#dac063' : 'rgba(255,255,255,0.35)',
            fontSize: 10, fontWeight: tab.active ? 700 : 400,
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
