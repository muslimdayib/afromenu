import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/supabase-server'

// GET /api/staff/[slug] – list staff members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { user } = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const establishment = await prisma.establishment.findUnique({
      where: { slug },
      select: { id: true, userId: true },
    })
    if (!establishment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Only owner can view staff
    if (establishment.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const staff = await prisma.staffMember.findMany({
      where: { establishmentId: establishment.id },
      orderBy: { invitedAt: 'desc' },
    })

    return NextResponse.json({
      staff: staff.map(s => ({
        id: s.id,
        email: s.email,
        role: s.role,
        invited_at: s.invitedAt.toISOString(),
        accepted_at: s.acceptedAt?.toISOString() || null,
        user_id: s.userId,
      })),
    })
  } catch (err: any) {
    console.error('[staff GET]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/staff/[slug] – invite a new staff member
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { user } = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const establishment = await prisma.establishment.findUnique({
      where: { slug },
      select: { id: true, userId: true },
    })
    if (!establishment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (establishment.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { email, role = 'editor' } = body

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    // Check if already invited
    const existing = await prisma.staffMember.findFirst({
      where: { establishmentId: establishment.id, email },
    })
    if (existing) {
      return NextResponse.json({ error: 'Already invited' }, { status: 409 })
    }

    const member = await prisma.staffMember.create({
      data: {
        establishmentId: establishment.id,
        email,
        role: ['editor', 'manager'].includes(role) ? role : 'editor',
      },
    })

    return NextResponse.json({
      member: {
        id: member.id,
        email: member.email,
        role: member.role,
        invited_at: member.invitedAt.toISOString(),
        accepted_at: null,
      },
    })
  } catch (err: any) {
    console.error('[staff POST]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/staff/[slug]?id=xxx – remove a staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { user } = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const establishment = await prisma.establishment.findUnique({
      where: { slug },
      select: { id: true, userId: true },
    })
    if (!establishment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (establishment.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const memberId = request.nextUrl.searchParams.get('id')
    if (!memberId) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await prisma.staffMember.delete({
      where: { id: memberId },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[staff DELETE]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
