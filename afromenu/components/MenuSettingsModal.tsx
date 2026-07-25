'use client'

import EditEstablishmentModal from './EditEstablishmentModal'

interface MenuSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedEstablishment?: any) => void
  establishment: any
}

/**
 * MenuSettingsModal – wraps EditEstablishmentModal for the "Menu Settings" flow.
 * Contains: branding, style, colors, logo, cover, currency, language, address,
 * social links, reviews, etc.
 */
export default function MenuSettingsModal({
  isOpen,
  onClose,
  onSuccess,
  establishment,
}: MenuSettingsModalProps) {
  return (
    <EditEstablishmentModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      establishment={establishment}
    />
  )
}
