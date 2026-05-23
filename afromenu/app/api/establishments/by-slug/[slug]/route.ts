import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  console.log("GET /api/establishments/by-slug called");
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter is required" },
        { status: 400 }
      );
    }

    // 1. Fetch the establishment
    const establishment = await prisma.establishment.findUnique({
      where: { slug },
    });

    if (!establishment) {
      return NextResponse.json(
        { error: "Establishment not found" },
        { status: 404 }
      );
    }

    // 2. Fetch categories
    const categories = await prisma.category.findMany({
      where: {
        establishmentId: establishment.id,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    // 3. Fetch items
    const categoryIds = categories.map((c) => c.id);
    let items: any[] = [];

    if (categoryIds.length > 0) {
      items = await prisma.item.findMany({
        where: {
          categoryId: { in: categoryIds },
        },
        orderBy: {
          sortOrder: "asc",
        },
      });
    }

    // 4. Map Prisma model structures to snake_case for 100% frontend compatibility
    const mappedEstablishment = {
      id: establishment.id,
      user_id: establishment.userId,
      name: establishment.name,
      slug: establishment.slug,
      currency: establishment.currency,
      currency_symbol: establishment.currencySymbol,
      language: establishment.language,
      template_style: establishment.templateStyle,
      brand_color: establishment.brandColor,
      logo_url: establishment.logoUrl,
      background_url: establishment.backgroundUrl,
      wifi_password: establishment.wifiPassword,
      phone: establishment.phone,
      is_active: establishment.isActive,
      paid_until: establishment.paidUntil.toISOString(),
      created_at: establishment.createdAt.toISOString(),
      theme: establishment.theme,
    };

    const mappedCategories = categories.map((cat) => ({
      id: cat.id,
      establishment_id: cat.establishmentId,
      name: cat.name,
      image_url: cat.imageUrl,
      sort_order: cat.sortOrder,
      is_visible: cat.isVisible,
      section_name: cat.sectionName,
      created_at: cat.createdAt.toISOString(),
    }));

    const mappedItems = items.map((item) => ({
      id: item.id,
      category_id: item.categoryId,
      name: item.name,
      description: item.description,
      price: Number(item.price), // Convert Decimal to normal float number
      image_url: item.imageUrl,
      is_available: item.isAvailable,
      sort_order: item.sortOrder,
      tags: item.tags || [],
      created_at: item.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      establishment: mappedEstablishment,
      categories: mappedCategories,
      items: mappedItems,
    });

  } catch (error: any) {
    console.error("Failed to query establishment by slug:", error);
    return NextResponse.json(
      {
        error: "Database query failed",
        details: error.message || "An unexpected error occurred while querying the database."
      },
      { status: 500 }
    );
  }
}
