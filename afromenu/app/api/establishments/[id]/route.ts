import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("PUT /api/establishments/[id] called");
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Establishment ID is required" },
        { status: 400 }
      );
    }

    // 1. Authenticate Request
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or malformed authorization token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    
    // Retrieve user session from Supabase using JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { 
          error: "Unauthorized: Invalid or expired token", 
          details: authError?.message || "Token verification failed" 
        },
        { status: 401 }
      );
    }

    // 2. Read Request Body
    const body = await req.json();
    console.log("Establishment PUT body:", body);

    const {
      name,
      theme,
      currency,
      language,
      phone,
    } = body;

    const brand_color = body.brand_color !== undefined ? body.brand_color : body.brandColor;
    const currency_symbol = body.currency_symbol !== undefined ? body.currency_symbol : body.currencySymbol;
    const wifi_password = body.wifi_password !== undefined ? body.wifi_password : body.wifiPassword;
    const logo_url = body.logo_url !== undefined ? body.logo_url : body.logoUrl;
    const background_url = body.background_url !== undefined ? body.background_url : body.backgroundUrl;
    const menu_style = body.menu_style !== undefined ? body.menu_style : body.menuStyle;

    // Verify ownership of the establishment
    const existingEst = await prisma.establishment.findUnique({
      where: { id },
    });

    if (!existingEst) {
      return NextResponse.json(
        { error: "Establishment not found" },
        { status: 404 }
      );
    }

    if (existingEst.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this establishment" },
        { status: 403 }
      );
    }

    // 3. Update Database via Prisma
    const updatedEst = await prisma.establishment.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        currency: currency !== undefined ? currency : undefined,
        currencySymbol: currency_symbol !== undefined ? currency_symbol : undefined,
        language: language !== undefined ? language : undefined,
        wifiPassword: wifi_password !== undefined ? wifi_password : undefined,
        phone: phone !== undefined ? phone : undefined,
        logoUrl: logo_url !== undefined ? logo_url : undefined,
        backgroundUrl: background_url !== undefined ? background_url : undefined,
        brandColor: brand_color !== undefined ? brand_color : undefined,
        theme: theme !== undefined ? theme : undefined,
        menuStyle: menu_style !== undefined ? menu_style : undefined,
      },
    });

    console.log("Establishment updated successfully:", updatedEst);

    // Map Prisma snake_case response
    const mappedEst = {
      id: updatedEst.id,
      user_id: updatedEst.userId,
      name: updatedEst.name,
      slug: updatedEst.slug,
      currency: updatedEst.currency,
      currency_symbol: updatedEst.currencySymbol,
      language: updatedEst.language,
      brand_color: updatedEst.brandColor,
      logo_url: updatedEst.logoUrl,
      background_url: updatedEst.backgroundUrl,
      wifi_password: updatedEst.wifiPassword,
      phone: updatedEst.phone,
      is_active: updatedEst.isActive,
      theme: updatedEst.theme,
      menu_style: updatedEst.menuStyle,
    };

    return NextResponse.json({
      success: true,
      establishment: mappedEst,
    });

  } catch (error: any) {
    console.error("Database operation failed inside PUT /api/establishments/[id]:", error);
    return NextResponse.json(
      {
        error: "Database operation failed",
        details: error.message || "An unexpected error occurred."
      },
      { status: 500 }
    );
  }
}
