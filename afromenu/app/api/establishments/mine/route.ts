import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/supabase-server";

export async function GET(req: Request) {
  console.log("[GET /api/establishments/mine] called");
  
  try {
    const { user, error: authError } = await getAuthUser();

    if (authError || !user) {
      console.log("[mine] returning 401");
      return NextResponse.json(
        { error: "Unauthorized: Invalid or expired session", establishments: [] },
        { status: 401 }
      );
    }

    // Query using the correct Prisma camelCase fields (userId, createdAt)
    const establishments = await prisma.establishment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map Prisma models back to snake_case to preserve frontend compatibility (user_id, menu_style, created_at)
    const mappedEstablishments = establishments.map((est) => ({
      id: est.id,
      user_id: est.userId,
      name: est.name,
      slug: est.slug,
      currency: est.currency,
      currency_symbol: est.currencySymbol,
      language: est.language,
      menu_style: est.menuStyle,
      brand_color: est.brandColor,
      brand_color_secondary: est.brandColorSecondary,
      logo_url: est.logoUrl,
      background_url: est.backgroundUrl,
      wifi_password: est.wifiPassword,
      phone: est.phone,
      is_active: est.isActive,
      paid_until: est.paidUntil.toISOString(),
      created_at: est.createdAt.toISOString(),
    }));

    console.log("[mine] found:", mappedEstablishments.length);

    return NextResponse.json({
      success: true,
      establishments: mappedEstablishments,
    }, {
      headers: {
        "Cache-Control": "private, max-age=60"
      }
    });

  } catch (error: any) {
    console.error("Database query failed inside GET /api/establishments/mine:", error);
    return NextResponse.json(
      { establishments: [], error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
