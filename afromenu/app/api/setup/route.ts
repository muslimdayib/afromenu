import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  console.log("GET /api/setup called");
  const results = [];
  const buckets = ['logos', 'covers', 'items', 'categories'];

  // Initialize service role client if keys are present (might fail or use placeholders)
  let supabase: any = null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (supabaseUrl && supabaseKey && supabaseKey !== "your_service_role_key_here") {
    try {
      supabase = createClient(supabaseUrl, supabaseKey);
    } catch (e: any) {
      console.warn("Could not construct service-role client:", e.message);
    }
  }

  for (const bucket of buckets) {
    let apiSuccess = false;

    // Method 1: Try creating via Supabase Admin API
    if (supabase) {
      try {
        const { error } = await supabase.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: 10485760
        });
        if (!error || error.message.includes('already exists')) {
          results.push({ bucket, method: 'API', status: 'created' });
          apiSuccess = true;
        } else {
          console.warn(`Supabase API failed to create bucket ${bucket}:`, error.message);
        }
      } catch (err: any) {
        console.warn(`Supabase API exception for bucket ${bucket}:`, err.message);
      }
    }

    // Method 2: Direct database schema fallback insertion via Prisma if Method 1 was skipped or failed
    if (!apiSuccess) {
      try {
        console.log(`Direct database fallback for bucket: "${bucket}"...`);
        
        // Execute raw SQL to insert directly into Supabase's storage.buckets table
        await prisma.$executeRawUnsafe(`
          INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
          VALUES ($1, $2, true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/jpg'])
          ON CONFLICT (id) DO NOTHING;
        `, bucket, bucket);

        results.push({ bucket, method: 'DIRECT_SQL', status: 'created' });
      } catch (dbErr: any) {
        console.error(`Direct SQL insert failed for ${bucket}:`, dbErr.message);
        results.push({ bucket, method: 'FAILED', status: dbErr.message });
      }
    }
  }

  return NextResponse.json({ success: true, results });
}
