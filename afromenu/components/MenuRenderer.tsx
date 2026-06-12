'use client'

import LuxuryDarkMenu from './menu-styles/LuxuryDarkMenu'

interface MenuRendererProps {
  establishment: any
  categories: any[]
  items: any[]
  isEditing?: boolean
  onUpdate?: (data: any) => void
}

export default function MenuRenderer({
  establishment,
  categories,
  items,
  isEditing = false,
  onUpdate,
}: MenuRendererProps) {
  const style = establishment?.menu_style || 'luxury-dark'

  // Route to correct style component
  if (style === 'luxury-dark') {
    return (
      <LuxuryDarkMenu
        establishment={establishment}
        categories={categories}
        items={items}
        isEditing={isEditing}
        onUpdate={onUpdate}
      />
    )
  }

  // Future styles go here:
  // if (style === 'style-2') return <Style2Menu ... />

  // Default fallback
  return (
    <LuxuryDarkMenu
      establishment={establishment}
      categories={categories}
      items={items}
      isEditing={isEditing}
      onUpdate={onUpdate}
    />
  )
}
