import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter is required" },
        { status: 400 }
      );
    }

    const establishment = await prisma.establishment.findUnique({
      where: { slug }
    });
    
    if (!establishment) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }
    
    // Map database properties to snake_case for frontend compatibility
    const mappedEst = {
      id: establishment.id,
      user_id: establishment.userId,
      name: establishment.name,
      slug: establishment.slug,
      currency: establishment.currency,
      currency_symbol: establishment.currencySymbol,
      language: establishment.language,
      menu_style: establishment.menuStyle,
      brand_color: establishment.brandColor,
      brand_color_secondary: establishment.brandColorSecondary,
      logo_url: establishment.logoUrl,
      background_url: establishment.backgroundUrl,
      wifi_password: establishment.wifiPassword,
      phone: establishment.phone,
      is_active: establishment.isActive,
      paid_until: establishment.paidUntil.toISOString(),
      created_at: establishment.createdAt.toISOString(),
    };

    return NextResponse.json({ establishment: mappedEst });
    
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
