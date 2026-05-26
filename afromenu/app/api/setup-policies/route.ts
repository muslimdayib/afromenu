import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  console.log("GET /api/setup-policies called");
  const results = [];
  const commands = [
    { name: "Public Access DROP", sql: `DROP POLICY IF EXISTS "Public Access" ON storage.objects;` },
    { name: "Auth Upload DROP", sql: `DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;` },
    { name: "Auth Update DROP", sql: `DROP POLICY IF EXISTS "Auth Update" ON storage.objects;` },
    { name: "Auth Delete DROP", sql: `DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;` },
    { name: "Public Access CREATE", sql: `CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('logos','covers','items','categories'));` },
    { name: "Auth Upload CREATE", sql: `CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id IN ('logos','covers','items','categories'));` },
    { name: "Auth Update CREATE", sql: `CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING (auth.uid() = owner);` },
    { name: "Auth Delete CREATE", sql: `CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (auth.uid() = owner);` }
  ];

  for (const cmd of commands) {
    try {
      console.log(`Executing SQL statement for ${cmd.name}:`, cmd.sql);
      await prisma.$executeRawUnsafe(cmd.sql);
      results.push({ command: cmd.name, status: "success" });
    } catch (err: any) {
      console.warn(`SQL statement failed for ${cmd.name}:`, err.message);
      results.push({ command: cmd.name, status: "failed", error: err.message });
    }
  }

  console.log("=== SQL POLICIES SETUP COMPLETE ===");
  return NextResponse.json({ success: true, results });
}
