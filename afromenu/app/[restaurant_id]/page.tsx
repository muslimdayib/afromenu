import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import type { Restaurant, Category, MenuItem } from "@/lib/supabase";
import RestaurantHeader from "@/components/RestaurantHeader";
import CategoryNav from "@/components/CategoryNav";
import MenuSection from "@/components/MenuSection";
import EmptyState from "@/components/EmptyState";
import NotFoundPage from "@/components/NotFound";

interface PageProps {
  params: Promise<{ restaurant_id: string }>;
}

/* ── Fetch restaurant by UUID or slug ─────────────────────────────── */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function fetchRestaurant(param: string) {
  const isUUID = UUID_RE.test(param);
  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq(isUUID ? "id" : "slug", param)
    .single();
  return { data: data as Restaurant | null, error };
}

/* ── Dynamic SEO metadata ─────────────────────────────────────────── */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { restaurant_id } = await params;
  const { data: restaurant } = await fetchRestaurant(restaurant_id);

  if (!restaurant) {
    return { title: "Menu Not Found – Afromenu" };
  }

  return {
    title: `${restaurant.name} – Menu | Afromenu`,
    description: `Browse the full menu for ${restaurant.name}. Powered by Afromenu.`,
  };
}

/* ── Page component ───────────────────────────────────────────────── */
export default async function RestaurantPage({ params }: PageProps) {
  const { restaurant_id } = await params;

  /* 1. Fetch restaurant */
  const { data: restaurant, error: restError } = await fetchRestaurant(restaurant_id);

  if (restError || !restaurant) {
    return <NotFoundPage />;
  }

  /* 2. Fetch categories */
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("display_order", { ascending: true });

  const typedCategories = (categories ?? []) as Category[];

  /* 3. Fetch all menu items */
  const categoryIds = typedCategories.map((c) => c.id);
  let typedItems: MenuItem[] = [];

  if (categoryIds.length > 0) {
    const { data: items } = await supabase
      .from("menu_items")
      .select("*")
      .in("category_id", categoryIds)
      .eq("is_hidden", false)
      .order("sort_order", { ascending: true });

    typedItems = (items ?? []) as MenuItem[];
  }

  /* 4. Group items by category */
  const itemsByCategory = new Map<string, MenuItem[]>();
  for (const item of typedItems) {
    const existing = itemsByCategory.get(item.category_id) ?? [];
    existing.push(item);
    itemsByCategory.set(item.category_id, existing);
  }

  const hasContent = typedCategories.length > 0 && typedItems.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-charcoal-950">
      <RestaurantHeader
        name={restaurant.name}
        logoUrl={restaurant.logo_url}
        description={restaurant.description}
        address={restaurant.address}
        phone={restaurant.phone}
        wifiPassword={restaurant.wifi_password}
      />

      {hasContent ? (
        <>
          <CategoryNav
            categories={typedCategories.map((c) => ({ id: c.id, name: c.name }))}
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
                  currency={restaurant.currency ?? "$"}
                />
              );
            })}
          </main>
        </>
      ) : (
        <EmptyState />
      )}

      <footer className="py-6 text-center border-t border-border">
        <p className="text-xs text-cream-muted flex items-center justify-center gap-1">
          Powered by{" "}
          <span className="text-gold-500 font-semibold flex items-center gap-1">
            <img src="/icon.png" alt="Afromenu Logo" className="w-3.5 h-3.5 object-contain inline" />
            Afromenu
          </span>
        </p>
      </footer>
    </div>
  );
}
