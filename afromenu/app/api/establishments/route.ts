import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  console.log("POST /api/establishments called");
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log("Onboarding POST body:", body);

    const { name, slug, currencyCode, language, templateStyle } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
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
    ].find((c) => c.code === currencyCode);

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

    // Write directly to database via Prisma (bypassing client-side RLS!)
    const establishment = await prisma.establishment.create({
      data: {
        userId: user.id,
        name,
        slug,
        currency: currencyLabel,
        currencySymbol: symbol,
        language: language || "English",
        templateStyle: templateStyle || "minimalist",
        brandColor: "#f7906c", // Matching the new brand color
      },
    });

    console.log("Database write success:", establishment);

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
    console.error("FULL ERROR:", error);
    return NextResponse.json(
      {
        error: error.message || "Database write failed",
        details: error.message || "An unexpected error occurred."
      },
      { status: 500 }
    );
  }
}
