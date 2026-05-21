import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import type { Restaurant, Category, MenuItem } from "@/lib/supabase";
import RestaurantHeader from "@/components/RestaurantHeader";
import CategoryNav from "@/components/CategoryNav";
import MenuSection from "@/components/MenuSection";
import EmptyState from "@/components/EmptyState";
import NotFoundPage from "@/components/NotFound";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface PageProps {
  params: Promise<{ restaurant_id: string }>;
}

/* -------------------------------------------------------------------------- */
/*  Dynamic SEO metadata                                                       */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { restaurant_id } = await params;

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name")
    .eq("id", restaurant_id)
    .single();

  if (!restaurant) {
    return { title: "Menu Not Found — Afromenu" };
  }

  return {
    title: `${restaurant.name} — Menu | Afromenu`,
    description: `Browse the full menu for ${restaurant.name}. Powered by Afromenu.`,
  };
}

/* -------------------------------------------------------------------------- */
/*  Page component (Server Component — no "use client")                        */
/* -------------------------------------------------------------------------- */

export default async function RestaurantPage({ params }: PageProps) {
  const { restaurant_id } = await params;

  /* ---- 1. Fetch restaurant ---- */
  const { data: restaurant, error: restError } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", restaurant_id)
    .single();

  if (restError || !restaurant) {
    return <NotFoundPage />;
  }

  const typedRestaurant = restaurant as Restaurant;

  /* ---- 2. Fetch categories (ordered) ---- */
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("restaurant_id", restaurant_id)
    .order("display_order", { ascending: true });

  const typedCategories = (categories ?? []) as Category[];

  /* ---- 3. Fetch all menu items for these categories in one query ---- */
  const categoryIds = typedCategories.map((c) => c.id);

  let typedItems: MenuItem[] = [];

  if (categoryIds.length > 0) {
    const { data: items } = await supabase
      .from("menu_items")
      .select("*")
      .in("category_id", categoryIds);

    typedItems = (items ?? []) as MenuItem[];
  }

  /* ---- 4. Group items by category_id ---- */
  const itemsByCategory = new Map<number, MenuItem[]>();
  for (const item of typedItems) {
    const existing = itemsByCategory.get(item.category_id) ?? [];
    existing.push(item);
    itemsByCategory.set(item.category_id, existing);
  }

  /* ---- 5. Check if there is any content to show ---- */
  const hasContent =
    typedCategories.length > 0 && typedItems.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-charcoal-950">
      <RestaurantHeader
        name={typedRestaurant.name}
        logoUrl={typedRestaurant.logo_url}
      />

      {hasContent ? (
        <>
          <CategoryNav
            categories={typedCategories.map((c) => ({
              id: c.id,
              name: c.name,
            }))}
          />

          <main className="flex-1 max-w-5xl w-full mx-auto pb-12">
            {typedCategories.map((cat) => {
              const sectionItems = itemsByCategory.get(cat.id) ?? [];
              return (
                <MenuSection
                  key={cat.id}
                  categoryId={cat.id}
                  categoryName={cat.name}
                  items={sectionItems}
                />
              );
            })}
          </main>
        </>
      ) : (
        <EmptyState />
      )}

      {/* Minimal branded footer */}
      <footer className="py-6 text-center border-t border-border">
        <p className="text-xs text-cream-muted">
          Powered by{" "}
          <span className="text-gold-500 font-semibold">Afromenu</span>
        </p>
      </footer>
    </div>
  );
}
