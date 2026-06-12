'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MenuRenderer from '@/components/MenuRenderer'

export default function MenuPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [establishment, setEstablishment] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load menu data (public - no auth needed)
        let menuData: any = null
        const menuRes = await fetch(`/api/menu/${slug}`)
        if (menuRes.ok) {
          menuData = await menuRes.json()
          setEstablishment(menuData.establishment)
          setCategories(menuData.categories || [])
          setItems(menuData.items || [])
        }

        // Check if current user is the owner
        try {
          const authRes = await fetch('/api/auth/me', {
            credentials: 'include',
          })
          if (authRes.ok) {
            const authData = await authRes.json()
            if (authData.user && menuData?.establishment?.user_id === authData.user.id) {
              setIsOwner(true)
              // Since they are the owner, load complete data (with hidden categories/items)
              const ownerRes = await fetch(`/api/establishments/by-slug/${slug}`)
              if (ownerRes.ok) {
                const ownerData = await ownerRes.json()
                setEstablishment(ownerData.establishment)
                setCategories(ownerData.categories || [])
                setItems(ownerData.items || [])
              }
            }
          }
        } catch {
          // Not logged in - customer view
        }
      } catch (err) {
        console.error('Failed to load menu:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [slug])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{
          width: 44,
          height: 44,
          border: '2px solid rgba(218,192,99,0.2)',
          borderTop: '2px solid #dac063',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
          Loading menu...
        </p>
      </div>
    )
  }

  if (!establishment) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 16,
      }}>
        Menu not found
      </div>
    )
  }

  // BOTH owner and customer use the same renderer
  // Only isEditing prop is different
  return (
    <MenuRenderer
      establishment={establishment}
      categories={categories}
      items={items}
      isEditing={isOwner}
      onUpdate={(updated) => {
        if (updated.establishment) setEstablishment(updated.establishment)
        if (updated.categories) setCategories(updated.categories)
        if (updated.items) setItems(updated.items)
      }}
    />
  )
}
