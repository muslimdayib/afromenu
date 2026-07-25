import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/supabase-server'

// GET /api/operating-hours/[slug]
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

    const hours = await prisma.operatingHours.findUnique({
      where: { establishmentId: establishment.id },
    })

    if (!hours) {
      return NextResponse.json({ hours: null })
    }

    return NextResponse.json({
      hours: {
        monday_open: hours.mondayOpen,
        monday_close: hours.mondayClose,
        monday_enabled: hours.mondayEnabled,
        tuesday_open: hours.tuesdayOpen,
        tuesday_close: hours.tuesdayClose,
        tuesday_enabled: hours.tuesdayEnabled,
        wednesday_open: hours.wednesdayOpen,
        wednesday_close: hours.wednesdayClose,
        wednesday_enabled: hours.wednesdayEnabled,
        thursday_open: hours.thursdayOpen,
        thursday_close: hours.thursdayClose,
        thursday_enabled: hours.thursdayEnabled,
        friday_open: hours.fridayOpen,
        friday_close: hours.fridayClose,
        friday_enabled: hours.fridayEnabled,
        saturday_open: hours.saturdayOpen,
        saturday_close: hours.saturdayClose,
        saturday_enabled: hours.saturdayEnabled,
        sunday_open: hours.sundayOpen,
        sunday_close: hours.sundayClose,
        sunday_enabled: hours.sundayEnabled,
      },
    })
  } catch (err: any) {
    console.error('[operating-hours GET]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/operating-hours/[slug] – save operating hours
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

    const data = {
      mondayOpen: body.monday_open || '09:00',
      mondayClose: body.monday_close || '22:00',
      mondayEnabled: body.monday_enabled !== false,
      tuesdayOpen: body.tuesday_open || '09:00',
      tuesdayClose: body.tuesday_close || '22:00',
      tuesdayEnabled: body.tuesday_enabled !== false,
      wednesdayOpen: body.wednesday_open || '09:00',
      wednesdayClose: body.wednesday_close || '22:00',
      wednesdayEnabled: body.wednesday_enabled !== false,
      thursdayOpen: body.thursday_open || '09:00',
      thursdayClose: body.thursday_close || '22:00',
      thursdayEnabled: body.thursday_enabled !== false,
      fridayOpen: body.friday_open || '09:00',
      fridayClose: body.friday_close || '22:00',
      fridayEnabled: body.friday_enabled !== false,
      saturdayOpen: body.saturday_open || '09:00',
      saturdayClose: body.saturday_close || '22:00',
      saturdayEnabled: body.saturday_enabled !== false,
      sundayOpen: body.sunday_open || '09:00',
      sundayClose: body.sunday_close || '22:00',
      sundayEnabled: body.sunday_enabled !== false,
    }

    await prisma.operatingHours.upsert({
      where: { establishmentId: establishment.id },
      update: data,
      create: {
        establishmentId: establishment.id,
        ...data,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[operating-hours POST]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
