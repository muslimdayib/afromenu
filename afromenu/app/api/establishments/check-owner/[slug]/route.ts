import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { user } = await getAuthUser()
    if (!user) return NextResponse.json({ isOwner: false })

    const establishment = await prisma.establishment.findUnique({
      where: { slug },
      select: { userId: true },
    })
    if (!establishment) return NextResponse.json({ isOwner: false })

    const isOwner = establishment.userId === user.id

    return NextResponse.json({ isOwner })
  } catch {
    return NextResponse.json({ isOwner: false })
  }
}
