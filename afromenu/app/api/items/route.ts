import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/supabase-server";

export async function POST(req: Request) {
  console.log("POST /api/items called");
  try {
    const { user } = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Item POST body:", body);

    const {
      id,
      categoryId,
      name,
      description,
      price,
      imageUrl,
      model3dUrl,
      isAvailable,
      tags,
      sortOrder,
      addons,
      scheduledPrice,
      scheduledStart,
      scheduledEnd,
      weight,
      oldPrice,
      variants,
      isVisible,
    } = body;

    if (id) {
      // Authenticate ownership of the existing item
      const existing = await prisma.item.findUnique({
        where: { id },
        include: {
          category: {
            include: { establishment: true }
          }
        }
      });

      if (!existing || existing.category.establishment.userId !== user.id) {
        return NextResponse.json({ error: "Unauthorized: You do not own this establishment" }, { status: 403 });
      }

      // Flexible Update existing
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description || null;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
      if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
      if (tags !== undefined) updateData.tags = tags;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
      
      // Save addons JSON (serialize if string, or keep as is)
      if (addons !== undefined) {
        updateData.addons = typeof addons === "string" ? JSON.parse(addons) : addons;
      }
      
      // Save scheduled pricing fields
      if (scheduledPrice !== undefined) {
        updateData.scheduledPrice = scheduledPrice === null ? null : parseFloat(scheduledPrice);
      }
      if (scheduledStart !== undefined) {
        updateData.scheduledStart = scheduledStart === null ? null : new Date(scheduledStart);
      }
      if (scheduledEnd !== undefined) {
        updateData.scheduledEnd = scheduledEnd === null ? null : new Date(scheduledEnd);
      }

      // Save custom fields
      if (isVisible !== undefined) {
        updateData.isVisible = isVisible;
      }
      if (weight !== undefined) {
        updateData.weight = weight || null;
      }
      if (oldPrice !== undefined) {
        updateData.oldPrice = oldPrice === null ? null : parseFloat(oldPrice);
      }
      if (variants !== undefined) {
        updateData.variants = typeof variants === "string" ? JSON.parse(variants) : variants;
      }

      const item = await prisma.item.update({
        where: { id },
        data: updateData,
      });
      console.log("Item updated successfully:", item);
      return NextResponse.json({ success: true, item });
    } else {
      // Create new
      if (!name || price === undefined) {
        return NextResponse.json(
          { error: "Name and price are required" },
          { status: 400 }
        );
      }
      if (!categoryId) {
        return NextResponse.json(
          { error: "Category ID is required for new item" },
          { status: 400 }
        );
      }

      // Authenticate ownership of target category's establishment
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: { establishment: true }
      });

      if (!category || category.establishment.userId !== user.id) {
        return NextResponse.json({ error: "Unauthorized: You do not own this establishment" }, { status: 403 });
      }

      const item = await prisma.item.create({
        data: {
          categoryId,
          name,
          description: description || null,
          price: parseFloat(price),
          imageUrl: imageUrl || null,
          isAvailable: isAvailable !== undefined ? isAvailable : true,
          tags: tags || [],
          sortOrder: sortOrder || 0,
          addons: addons !== undefined ? (typeof addons === "string" ? JSON.parse(addons) : addons) : [],
          scheduledPrice: scheduledPrice !== undefined && scheduledPrice !== null ? parseFloat(scheduledPrice) : null,
          scheduledStart: scheduledStart !== undefined && scheduledStart !== null ? new Date(scheduledStart) : null,
          scheduledEnd: scheduledEnd !== undefined && scheduledEnd !== null ? new Date(scheduledEnd) : null,
          isVisible: isVisible !== undefined ? isVisible : true,
          weight: weight || null,
          oldPrice: oldPrice !== undefined && oldPrice !== null ? parseFloat(oldPrice) : null,
          variants: variants !== undefined ? (typeof variants === "string" ? JSON.parse(variants) : variants) : [],
        },
      });
      console.log("Item created successfully:", item);
      return NextResponse.json({ success: true, item });
    }

  } catch (error: any) {
    console.error("Database operation failed inside POST /api/items:", error);
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
  console.log("DELETE /api/items called");
  try {
    const { user } = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Authenticate ownership of the item
    const existing = await prisma.item.findUnique({
      where: { id },
      include: {
        category: {
          include: { establishment: true }
        }
      }
    });

    if (!existing || existing.category.establishment.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized: You do not own this establishment" }, { status: 403 });
    }

    const item = await prisma.item.delete({
      where: { id },
    });

    console.log("Item deleted successfully:", item);
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error("Database operation failed inside DELETE /api/items:", error);
    return NextResponse.json(
      {
        error: "Database operation failed",
        details: error.message || "An unexpected error occurred."
      },
      { status: 500 }
    );
  }
}
