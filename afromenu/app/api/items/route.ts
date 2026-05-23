import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  console.log("POST /api/items called");
  try {
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
    } = body;

    if (id) {
      // Flexible Update existing
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description || null;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
      if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
      if (tags !== undefined) updateData.tags = tags;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
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
