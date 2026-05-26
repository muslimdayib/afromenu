'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'
import BottomNav from '@/components/BottomNav'

export default function QRCodePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const qrRef = useRef<HTMLDivElement>(null)
  
  const [establishment, setEstablishment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  
  // The public menu URL
  const menuUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/p/${slug}`
    : `https://afromenu.com/p/${slug}`

  useEffect(() => {
    fetch(`/api/menu/${slug}`, {
      credentials: 'include'
    })
    .then(r => r.json())
    .then(data => {
      setEstablishment(data.establishment || data)
    })
    .catch(console.error)
    .finally(() => setLoading(false))
  }, [slug])

  const downloadQR = () => {
    try {
      const canvas = qrRef.current?.querySelector('canvas')
      if (!canvas) {
        // Try SVG fallback
        const svg = qrRef.current?.querySelector('svg')
        if (svg) {
          const svgData = new XMLSerializer().serializeToString(svg)
          const blob = new Blob([svgData], { type: 'image/svg+xml' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${slug}-qr-code.svg`
          a.click()
          URL.revokeObjectURL(url)
        }
        return
      }
      
      // Download as PNG
      const url = canvas.toDataURL('image/png', 1.0)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slug}-qr-code.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download failed:', err)
      alert('Download failed. Try right-clicking the QR code and saving it.')
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = menuUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: establishment?.name || 'My Menu',
          text: 'Scan QR code or visit our digital menu',
          url: menuUrl,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      copyLink()
    }
  }

  const brandColor = establishment?.brand_color || '#f2bd11'

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8f9fa',
      paddingBottom: 80 
    }}>
      {/* Header */}
      <div style={{
        background: '#1b3151',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <button
          onClick={() => router.push(`/p/${slug}`)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            color: 'white',
            fontSize: 18,
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
            color: 'white', 
            margin: 0, 
            fontSize: 18, 
            fontWeight: 700 
          }}>
            QR Code
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.6)', 
            margin: 0, 
            fontSize: 12 
          }}>
            {establishment?.name || slug}
          </p>
        </div>
      </div>

      <div style={{ padding: '24px 20px' }}>
        
        {/* QR Card */}
        <div style={{
          background: 'white',
          borderRadius: 24,
          padding: 32,
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          marginBottom: 20,
        }}>
          <p style={{ 
            fontSize: 13, 
            color: '#6b7280', 
            margin: '0 0 24px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 600,
          }}>
            Scan to view menu
          </p>

          {/* QR Code */}
          <div 
            ref={qrRef}
            style={{
              display: 'inline-block',
              padding: 16,
              background: 'white',
              borderRadius: 16,
              border: `3px solid ${brandColor}`,
              boxShadow: `0 0 0 6px ${brandColor}20`,
              marginBottom: 24,
            }}
          >
            <QRCodeCanvas
              value={menuUrl}
              size={220}
              level="H"
              includeMargin={false}
              fgColor="#1b3151"
              bgColor="#ffffff"
              imageSettings={establishment?.logo_url ? {
                src: establishment.logo_url,
                height: 40,
                width: 40,
                excavate: true,
              } : undefined}
            />
          </div>

          {/* Cafe name under QR */}
          <div style={{
            fontSize: 20,
            fontWeight: 800,
            color: '#1b3151',
            marginBottom: 4,
          }}>
            {establishment?.name || slug}
          </div>
          <div style={{
            fontSize: 13,
            color: '#6b7280',
            marginBottom: 24,
            wordBreak: 'break-all',
            padding: '0 16px',
          }}>
            {menuUrl}
          </div>

          {/* Download Button */}
          <button
            onClick={downloadQR}
            style={{
              background: brandColor,
              color: '#1b3151',
              border: 'none',
              borderRadius: 99,
              padding: '14px 32px',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              width: '100%',
              marginBottom: 12,
            }}
          >
            ⬇ Download QR Code PNG
          </button>
        </div>

        {/* Actions Card */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          marginBottom: 20,
        }}>
          <button
            onClick={copyLink}
            style={{
              width: '100%',
              padding: '16px 20px',
              background: 'none',
              border: 'none',
              borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 20 }}>{copied ? '✅' : '🔗'}</span>
            <div>
              <div style={{ 
                fontSize: 15, 
                fontWeight: 600,
                color: '#1b3151'
              }}>
                {copied ? 'Copied!' : 'Copy menu link'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                Share the link directly
              </div>
            </div>
            <span style={{ 
              marginLeft: 'auto', 
              color: '#9ca3af',
              fontSize: 18 
            }}>›</span>
          </button>

          <button
            onClick={shareLink}
            style={{
              width: '100%',
              padding: '16px 20px',
              background: 'none',
              border: 'none',
              borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 20 }}>📤</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1b3151' }}>
                Share menu
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                Send via WhatsApp, Instagram, etc.
              </div>
            </div>
            <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 18 }}>›</span>
          </button>

          <button
            onClick={() => window.open(menuUrl, '_blank')}
            style={{
              width: '100%',
              padding: '16px 20px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 20 }}>👁</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1b3151' }}>
                Preview customer view
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                See what your customers see
              </div>
            </div>
            <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 18 }}>›</span>
          </button>
        </div>

        {/* Tips Card */}
        <div style={{
          background: `${brandColor}15`,
          border: `1px solid ${brandColor}40`,
          borderRadius: 16,
          padding: 16,
        }}>
          <p style={{ 
            fontSize: 13, 
            fontWeight: 700, 
            color: '#1b3151',
            margin: '0 0 8px' 
          }}>
            💡 Tips
          </p>
          <ul style={{ 
            margin: 0, 
            padding: '0 0 0 16px',
            fontSize: 12,
            color: '#6b7280',
            lineHeight: 1.8,
          }}>
            <li>Print and place on each table</li>
            <li>Add to your Instagram bio link</li>
            <li>Share in WhatsApp groups</li>
            <li>Put on your entrance door</li>
          </ul>
        </div>
      </div>

      <BottomNav slug={slug} activeTab="qr" />
    </div>
  )
}
