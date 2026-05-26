import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/supabase-server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("=== PUT establishments/[id] ===");
  try {
    const { id } = await params;
    const { user, error: authError } = await getAuthUser();
    
    if (authError || !user) {
      console.log("[AUTH] No user found:", authError?.message);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    console.log("[AUTH] User authenticated:", user.id);
    
    const body = await request.json();
    
    // Verify ownership using camelCase userId
    const existing = await prisma.establishment.findFirst({
      where: { 
        id: id,
        userId: user.id 
      }
    });
    
    if (!existing) {
      const existing2 = await prisma.establishment.findFirst({
        where: { id }
      });
      console.log("Found without user filter:", existing2?.id);
      console.log("Owner:", existing2?.userId);
      console.log("Current user:", user.id);
      
      return NextResponse.json(
        { error: "Establishment not found" },
        { status: 404 }
      );
    }
    
    // Map request fields to Prisma camelCase model fields
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.currency !== undefined) updateData.currency = body.currency;
    
    const currency_symbol = body.currency_symbol !== undefined ? body.currency_symbol : body.currencySymbol;
    if (currency_symbol !== undefined) updateData.currencySymbol = currency_symbol;
    
    if (body.language !== undefined) updateData.language = body.language;
    
    const wifi_password = body.wifi_password !== undefined ? body.wifi_password : body.wifiPassword;
    if (wifi_password !== undefined) updateData.wifiPassword = wifi_password;
    
    if (body.phone !== undefined) updateData.phone = body.phone;
    
    const logo_url = body.logo_url !== undefined ? body.logo_url : body.logoUrl;
    if (logo_url !== undefined) updateData.logoUrl = logo_url;
    
    const background_url = body.background_url !== undefined ? body.background_url : body.backgroundUrl;
    if (background_url !== undefined) updateData.backgroundUrl = background_url;
    
    const brand_color = body.brand_color !== undefined ? body.brand_color : body.brandColor;
    if (brand_color !== undefined) updateData.brandColor = brand_color;
    
    const brand_color_secondary = body.brand_color_secondary !== undefined ? body.brand_color_secondary : body.brandColorSecondary;
    if (brand_color_secondary !== undefined) updateData.brandColorSecondary = brand_color_secondary;
    
    if (body.theme !== undefined) updateData.theme = body.theme;
    
    const menu_style = body.menu_style !== undefined ? body.menu_style : body.menuStyle;
    if (menu_style !== undefined) updateData.menuStyle = menu_style;

    if (body.tagline !== undefined) updateData.tagline = body.tagline;
    if (body.address !== undefined) updateData.address = body.address;
    
    const website_url = body.website_url !== undefined ? body.website_url : body.websiteUrl;
    if (website_url !== undefined) updateData.websiteUrl = website_url;

    const instagram_url = body.instagram_url !== undefined ? body.instagram_url : body.instagramUrl;
    if (instagram_url !== undefined) updateData.instagramUrl = instagram_url;

    const tiktok_url = body.tiktok_url !== undefined ? body.tiktok_url : body.tiktokUrl;
    if (tiktok_url !== undefined) updateData.tiktokUrl = tiktok_url;

    const facebook_url = body.facebook_url !== undefined ? body.facebook_url : body.facebookUrl;
    if (facebook_url !== undefined) updateData.facebookUrl = facebook_url;

    const twitter_url = body.twitter_url !== undefined ? body.twitter_url : body.twitterUrl;
    if (twitter_url !== undefined) updateData.twitterUrl = twitter_url;

    const snapchat_url = body.snapchat_url !== undefined ? body.snapchat_url : body.snapchatUrl;
    if (snapchat_url !== undefined) updateData.snapchatUrl = snapchat_url;

    if (body.whatsapp !== undefined) updateData.whatsapp = body.whatsapp;

    const google_review = body.google_review !== undefined ? body.google_review : body.googleReview;
    if (google_review !== undefined) updateData.googleReview = google_review;

    const tripadvisor_url = body.tripadvisor_url !== undefined ? body.tripadvisor_url : body.tripadvisorUrl;
    if (tripadvisor_url !== undefined) updateData.tripadvisorUrl = tripadvisor_url;

    const show_reviews = body.show_reviews !== undefined ? body.show_reviews : body.showReviews;
    if (show_reviews !== undefined) updateData.showReviews = show_reviews;

    const review_style = body.review_style !== undefined ? body.review_style : body.reviewStyle;
    if (review_style !== undefined) updateData.reviewStyle = review_style;

    console.log("Updating fields:", Object.keys(updateData));
    
    const updated = await prisma.establishment.update({
      where: { id: id },
      data: updateData
    });
    
    console.log("Update success");

    // Map Prisma response back to snake_case format for frontend consistency
    const mappedEst = {
      id: updated.id,
      user_id: updated.userId,
      name: updated.name,
      slug: updated.slug,
      currency: updated.currency,
      currency_symbol: updated.currencySymbol,
      language: updated.language,
      brand_color: updated.brandColor,
      brand_color_secondary: updated.brandColorSecondary,
      logo_url: updated.logoUrl,
      background_url: updated.backgroundUrl,
      wifi_password: updated.wifiPassword,
      phone: updated.phone,
      is_active: updated.isActive,
      theme: updated.theme,
      menu_style: updated.menuStyle,
      tagline: updated.tagline,
      address: updated.address,
      website_url: updated.websiteUrl,
      instagram_url: updated.instagramUrl,
      tiktok_url: updated.tiktokUrl,
      facebook_url: updated.facebookUrl,
      twitter_url: updated.twitterUrl,
      snapchat_url: updated.snapchatUrl,
      whatsapp: updated.whatsapp,
      google_review: updated.googleReview,
      tripadvisor_url: updated.tripadvisorUrl,
      show_reviews: updated.showReviews,
      review_style: updated.reviewStyle,
    };

    return NextResponse.json({
      success: true,
      establishment: mappedEst,
    });
    
  } catch (error: any) {
    console.error("PUT error:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("GET /api/establishments/[id] called");
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Establishment ID is required" },
        { status: 400 }
      );
    }

    // A robust routing safety fallback in case dynamic routing intercepts "mine"
    if (id === "mine") {
      const { user, error: authError } = await getAuthUser();

      if (authError || !user) {
        return NextResponse.json(
          { error: "Unauthorized: Invalid or expired session" },
          { status: 401 }
        );
      }

      // Upsert User record
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

      const establishments = await prisma.establishment.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });

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

      return NextResponse.json({
        success: true,
        establishments: mappedEstablishments || [],
      });
    }

    // Otherwise, normal fetch single by ID
    const establishment = await prisma.establishment.findUnique({
      where: { id },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Establishment not found" },
        { status: 404 }
      );
    }

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

    return NextResponse.json({
      success: true,
      establishment: mappedEst,
    });
  } catch (error: any) {
    console.error("GET /api/establishments/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
