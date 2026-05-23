import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/establishments/mine
 * Fetches all establishments owned by the currently authenticated user.
 */
export async function GET(req: Request) {
  try {
    // 1. Authenticate Request (Auth Middleware Logic)
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or malformed authorization token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    
    // Retrieve the user from Supabase Auth using the JWT token
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

    // Ensure the User record exists in the public.users table to satisfy foreign key constraint
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email || "",
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
      },
      create: {
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
      },
    });

    // 2. Fetch User Establishments (Prisma Database Call)
    const establishments = await prisma.establishment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map Prisma models back to snake_case to preserve 100% frontend compatibility
    const mappedEstablishments = establishments.map((est) => ({
      id: est.id,
      user_id: est.userId,
      name: est.name,
      slug: est.slug,
      currency: est.currency,
      currency_symbol: est.currencySymbol,
      language: est.language,
      template_style: est.templateStyle,
      brand_color: est.brandColor,
      logo_url: est.logoUrl,
      background_url: est.backgroundUrl,
      wifi_password: est.wifiPassword,
      phone: est.phone,
      is_active: est.isActive,
      paid_until: est.paidUntil.toISOString(),
      created_at: est.createdAt.toISOString(),
    }));

    // 3. Return Successful Response
    return NextResponse.json({
      success: true,
      establishments: mappedEstablishments || [],
    });

  } catch (error: any) {
    console.error("Database query failed inside GET /api/establishments/mine:", error);
    
    // MUST return a 500 status on database failure as requested
    return NextResponse.json(
      { 
        error: "Database connection failed", 
        details: error.message || "An unexpected error occurred while querying the database." 
      },
      { status: 500 }
    );
  }
}
