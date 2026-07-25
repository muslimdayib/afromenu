'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MenuRenderer from '@/components/MenuRenderer'
import LogoLoadingScreen from '@/components/LogoLoadingScreen'

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
          const ownerRes = await fetch(
            `/api/establishments/check-owner/${slug}`,
            { credentials: 'include' }
          )
          if (ownerRes.ok) {
            const data = await ownerRes.json()
            if (data.isOwner === true) {
              setIsOwner(true)
              // Since they are the owner, load complete data (with hidden categories/items)
              const fullRes = await fetch(`/api/establishments/by-slug/${slug}`)
              if (fullRes.ok) {
                const fullData = await fullRes.json()
                setEstablishment(fullData.establishment)
                setCategories(fullData.categories || [])
                setItems(fullData.items || [])
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
    return <LogoLoadingScreen message="Loading menu..." />
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
