import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/supabase-server";

export async function POST(req: Request) {
  console.log("POST /api/categories called");
  try {
    const { user } = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Category POST body:", body);

    const {
      id,
      establishmentId,
      name,
      imageUrl,
      sortOrder,
      isVisible,
      sectionName,
      section_name,
      timeFrom,
      timeTo,
      time_from,
      time_to,
    } = body;

    const finalSectionName = sectionName !== undefined ? sectionName : section_name;
    const finalTimeFrom = timeFrom !== undefined ? timeFrom : time_from;
    const finalTimeTo = timeTo !== undefined ? timeTo : time_to;

    if (id) {
      // Authenticate ownership of existing category
      const existing = await prisma.category.findUnique({
        where: { id },
        include: { establishment: true }
      });

      if (!existing || existing.establishment.userId !== user.id) {
        return NextResponse.json({ error: "Unauthorized: You do not own this establishment" }, { status: 403 });
      }

      // Flexible Update existing
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
      if (isVisible !== undefined) updateData.isVisible = isVisible;
      if (finalSectionName !== undefined) updateData.sectionName = finalSectionName || null;
      if (finalTimeFrom !== undefined) updateData.timeFrom = finalTimeFrom || null;
      if (finalTimeTo !== undefined) updateData.timeTo = finalTimeTo || null;

      const category = await prisma.category.update({
        where: { id },
        data: updateData,
      });
      console.log("Category updated successfully:", category);
      return NextResponse.json({ success: true, category });
    } else {
      // Create new
      if (!name) {
        return NextResponse.json(
          { error: "Category name is required" },
          { status: 400 }
        );
      }
      if (!establishmentId) {
        return NextResponse.json(
          { error: "Establishment ID is required for new category" },
          { status: 400 }
        );
      }

      // Authenticate ownership of target establishment
      const establishment = await prisma.establishment.findUnique({
        where: { id: establishmentId }
      });

      if (!establishment || establishment.userId !== user.id) {
        return NextResponse.json({ error: "Unauthorized: You do not own this establishment" }, { status: 403 });
      }

      const category = await prisma.category.create({
        data: {
          establishmentId,
          name,
          imageUrl: imageUrl || null,
          sortOrder: sortOrder || 0,
          isVisible: isVisible !== undefined ? isVisible : true,
          sectionName: finalSectionName || null,
          timeFrom: finalTimeFrom || null,
          timeTo: finalTimeTo || null,
        },
      });
      console.log("Category created successfully:", category);
      return NextResponse.json({ success: true, category });
    }

  } catch (error: any) {
    console.error("Database operation failed inside POST /api/categories:", error);
    return NextResponse.json(
      {
        error: "Database operation failed",
        details: error.message || "An unexpected error occurred."
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  console.log("DELETE /api/categories called");
  try {
    const { user } = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Authenticate ownership
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { establishment: true }
    });

    if (!existing || existing.establishment.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized: You do not own this establishment" }, { status: 403 });
    }

    const category = await prisma.category.delete({
      where: { id },
    });

    console.log("Category deleted successfully:", category);
    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("Database operation failed inside DELETE /api/categories:", error);
    return NextResponse.json(
      {
        error: "Database operation failed",
        details: error.message || "An unexpected error occurred."
      },
      { status: 500 }
    );
  }
}
