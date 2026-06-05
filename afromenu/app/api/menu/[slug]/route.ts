import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedEstablishmentData } from "@/lib/seed";

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

    // Fetch visible categories
    let categories = await prisma.category.findMany({
      where: {
        establishmentId: establishment.id,
        isVisible: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    // Auto seed if empty
    if (categories.length === 0) {
      console.log("Seeding sample data for new establishment:", establishment.id);
      try {
        await seedEstablishmentData(establishment.id);
        // Re-fetch visible categories
        categories = await prisma.category.findMany({
          where: {
            establishmentId: establishment.id,
            isVisible: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        });
      } catch (seedErr) {
        console.error("Failed to seed sample data:", seedErr);
      }
    }

    // Fetch items under those categories
    const categoryIds = categories.map((c) => c.id);
    let items: any[] = [];
    if (categoryIds.length > 0) {
      items = await prisma.item.findMany({
        where: {
          categoryId: { in: categoryIds },
          isAvailable: true,
          isVisible: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      });
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
      brand_color: establishment.brandColor,
      brand_color_secondary: establishment.brandColorSecondary,
      logo_url: establishment.logoUrl,
      background_url: establishment.backgroundUrl,
      wifi_password: establishment.wifiPassword,
      phone: establishment.phone,
      is_active: establishment.isActive,
      paid_until: establishment.paidUntil.toISOString(),
      created_at: establishment.createdAt.toISOString(),
      theme: establishment.theme,
      menu_style: establishment.menuStyle,
      tagline: establishment.tagline,
      address: establishment.address,
      website_url: establishment.websiteUrl,
      instagram_url: establishment.instagramUrl,
      tiktok_url: establishment.tiktokUrl,
      facebook_url: establishment.facebookUrl,
      twitter_url: establishment.twitterUrl,
      snapchat_url: establishment.snapchatUrl,
      whatsapp: establishment.whatsapp,
      google_review: establishment.googleReview,
      tripadvisor_url: establishment.tripadvisorUrl,
      show_reviews: establishment.showReviews,
      review_style: establishment.reviewStyle,
    };

    const mappedCategories = categories.map((cat) => ({
      id: cat.id,
      establishment_id: cat.establishmentId,
      name: cat.name,
      image_url: cat.imageUrl,
      sort_order: cat.sortOrder,
      is_visible: cat.isVisible,
      section_name: cat.sectionName,
      time_from: cat.timeFrom,
      time_to: cat.timeTo,
      created_at: cat.createdAt.toISOString(),
    }));

    const mappedItems = items.map((item) => {
      // Determine if a scheduled price is active
      let finalPrice = Number(item.price);
      const now = new Date();
      if (
        item.scheduledPrice !== null &&
        item.scheduledPrice !== undefined &&
        item.scheduledStart &&
        item.scheduledEnd &&
        now >= new Date(item.scheduledStart) &&
        now <= new Date(item.scheduledEnd)
      ) {
        finalPrice = Number(item.scheduledPrice);
      }

      return {
        id: item.id,
        category_id: item.categoryId,
        category_name: categories.find(c => c.id === item.categoryId)?.name || "",
        name: item.name,
        weight: item.weight,
        price: finalPrice,
        original_price: Number(item.price),
        old_price: item.oldPrice ? Number(item.oldPrice) : null,
        variants: item.variants || [],
        description: item.description,
        image_url: item.imageUrl,
        is_visible: item.isVisible !== undefined ? item.isVisible : true,
        is_available: item.isAvailable,
        sort_order: item.sortOrder,
        tags: item.tags || [],
        addons: item.addons,
        scheduled_price: item.scheduledPrice ? Number(item.scheduledPrice) : null,
        scheduled_start: item.scheduledStart ? item.scheduledStart.toISOString() : null,
        scheduled_end: item.scheduledEnd ? item.scheduledEnd.toISOString() : null,
        created_at: item.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      establishment: mappedEst,
      categories: mappedCategories,
      items: mappedItems,
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60'
      }
    });
    
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
