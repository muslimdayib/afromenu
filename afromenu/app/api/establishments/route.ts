import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedEstablishmentData } from "@/lib/seed";
import { getAuthUser } from "@/lib/supabase-server";

export async function POST(req: Request) {
  console.log("[POST /api/establishments] called");
  
  try {
    const { user, error: authError } = await getAuthUser();

    if (authError || !user) {
      console.log("[POST] returning 401");
      return NextResponse.json(
        { error: "Unauthorized: Invalid token or session" },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log("[POST] body:", body);

    const name = body.name;
    const slug = body.slug;
    const currencyCode = body.currencyCode || body.currency || "SOS";
    const language = body.language || "English";
    const menuStyle = body.menuStyle || body.menu_style || "luxury-dark";

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.establishment.findUnique({
      where: { slug: slug }
    });
    
    if (existing) {
      return NextResponse.json(
        { error: "URL slug already taken. Choose another." },
        { status: 409 }
      );
    }

    const selectedCurrencyObj = [
      { name: "Somali Shilling", code: "SOS", symbol: "Sh" },
      { name: "US Dollar", code: "USD", symbol: "$" },
      { name: "Euro", code: "EUR", symbol: "€" },
      { name: "British Pound", code: "GBP", symbol: "£" },
      { name: "Kenyan Shilling", code: "KES", symbol: "KSh" },
      { name: "Ethiopian Birr", code: "ETB", symbol: "Br" },
      { name: "UAE Dirham", code: "AED", symbol: "د.إ" },
      { name: "Saudi Riyal", code: "SAR", symbol: "ر.س" },
      { name: "Turkish Lira", code: "TRY", symbol: "₺" },
      { name: "Egyptian Pound", code: "EGP", symbol: "E£" },
    ].find((c) => c.code === currencyCode || c.name === currencyCode);

    const symbol = selectedCurrencyObj ? selectedCurrencyObj.symbol : "$";
    const currencyLabel = selectedCurrencyObj ? selectedCurrencyObj.name : "US Dollar";

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

    // Create the establishment
    const establishment = await prisma.establishment.create({
      data: {
        userId: user.id,
        name,
        slug,
        currency: currencyLabel,
        currencySymbol: symbol,
        language: language,
        menuStyle: menuStyle,
        brandColor: "#f2bd11",
        brandColorSecondary: "#1b3151",
      },
    });

    // Automatically seed default sample menu data for new establishment
    await seedEstablishmentData(establishment.id);

    console.log("[POST] created:", establishment.id);

    return NextResponse.json({
      success: true,
      establishment: {
        id: establishment.id,
        user_id: establishment.userId,
        name: establishment.name,
        slug: establishment.slug,
      },
    });

  } catch (error: any) {
    console.error("[POST] error:", error.message);
    return NextResponse.json(
      {
        error: error.message || "Database write failed",
        details: error.message || "An unexpected error occurred."
      },
      { status: 500 }
    );
  }
}
