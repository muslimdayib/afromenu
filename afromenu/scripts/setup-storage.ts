import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manually load .env.local
try {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8')
    envFile.split('\n').forEach(line => {
      const parts = line.split('=')
      if (parts.length >= 2) {
        const key = parts[0].trim()
        const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '')
        if (key) {
          process.env[key] = val
        }
      }
    })
    console.log("Loaded environment variables from .env.local")
  }
} catch (e: any) {
  console.warn("Failed to manually load env variables:", e.message)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE URL or SERVICE ROLE KEY in environment!")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupStorage() {
  const buckets = ['logos', 'covers', 'items', 'categories']
  
  for (const bucket of buckets) {
    try {
      const { data, error } = await supabase.storage.createBucket(bucket, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      })
      if (error && !error.message.includes('already exists')) {
        console.error(`Failed to create ${bucket}:`, error.message)
      } else {
        console.log(`✓ Bucket "${bucket}" ready`)
      }
    } catch (e: any) {
      console.error(`Error configuring bucket ${bucket}:`, e.message || e)
    }
  }
}

setupStorage()
