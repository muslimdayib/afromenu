import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Establishment, Category, Item } from "@/lib/supabase";

interface MenuState {
  establishment: Establishment | null;
  categories: Category[];
  items: Item[];
  isOwner: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  fetchMenuData: (slug: string, userId?: string | null) => Promise<void>;
  setMenuData: (
    establishment: Establishment,
    categories: Category[],
    items: Item[],
    isOwner: boolean
  ) => void;

  // Category Actions
  addCategoryLocal: (category: Category) => void;
  updateCategoryLocal: (category: Category) => void;
  deleteCategoryLocal: (categoryId: string) => void;
  swapCategoryOrder: (index: number, direction: "up" | "down") => Promise<void>;

  // Item Actions
  addItemLocal: (item: Item) => void;
  updateItemLocal: (item: Item) => void;
  deleteItemLocal: (itemId: string) => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  establishment: null,
  categories: [],
  items: [],
  isOwner: false,
  loading: false,
  error: null,

  fetchMenuData: async (slug: string, userId?: string | null) => {
    set({ loading: true, error: null });
    try {
      // 1. Fetch establishment
      const { data: estData, error: estError } = await supabase
        .from("establishments")
        .select("*")
        .eq("slug", slug)
        .single();

      if (estError || !estData) {
        set({ establishment: null, categories: [], items: [], loading: false });
        return;
      }

      const isOwner = userId === estData.user_id;

      // 2. Fetch categories (filtering out soft deleted records)
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .eq("establishment_id", estData.id)
        .is("deleted_at", null) // Filter out soft deletes
        .order("sort_order", { ascending: true });

      if (catError) throw catError;

      // 3. Fetch items (filtering out soft deleted records)
      let itemsData: Item[] = [];
      if (catData && catData.length > 0) {
        const catIds = catData.map((c) => c.id);
        const { data, error: itemsError } = await supabase
          .from("items")
          .select("*")
          .in("category_id", catIds)
          .is("deleted_at", null) // Filter out soft deletes
          .order("sort_order", { ascending: true });

        if (itemsError) throw itemsError;
        itemsData = data || [];
      }

      set({
        establishment: estData as Establishment,
        categories: (catData || []) as Category[],
        items: itemsData,
        isOwner,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to load menu data", loading: false });
    }
  },

  setMenuData: (establishment, categories, items, isOwner) => {
    set({ establishment, categories, items, isOwner });
  },

  addCategoryLocal: (category) => {
    set((state) => ({
      categories: [...state.categories, category].sort(
        (a, b) => a.sort_order - b.sort_order
      ),
    }));
  },

  updateCategoryLocal: (category) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === category.id ? category : c
      ),
    }));
  },

  deleteCategoryLocal: (categoryId) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== categoryId),
      items: state.items.filter((i) => i.category_id !== categoryId),
    }));
  },

  swapCategoryOrder: async (index: number, direction: "up" | "down") => {
    const { categories } = get();
    const swapWithIndex = direction === "up" ? index - 1 : index + 1;
    if (swapWithIndex < 0 || swapWithIndex >= categories.length) return;

    const newCategories = [...categories];
    const catA = newCategories[index];
    const catB = newCategories[swapWithIndex];

    // Swap orders
    const tempOrder = catA.sort_order;
    catA.sort_order = catB.sort_order;
    catB.sort_order = tempOrder;

    newCategories[index] = catB;
    newCategories[swapWithIndex] = catA;

    // Sort again
    newCategories.sort((a, b) => a.sort_order - b.sort_order);

    set({ categories: newCategories });

    try {
      await Promise.all([
        supabase
          .from("categories")
          .update({ sort_order: catA.sort_order })
          .eq("id", catA.id),
        supabase
          .from("categories")
          .update({ sort_order: catB.sort_order })
          .eq("id", catB.id),
      ]);
    } catch (err) {
      console.error("Failed to sync category reorder to database:", err);
    }
  },

  addItemLocal: (item) => {
    set((state) => ({
      items: [...state.items, item].sort((a, b) => a.sort_order - b.sort_order),
    }));
  },

  updateItemLocal: (item) => {
    set((state) => ({
      items: state.items.map((i) => (i.id === item.id ? item : i)),
    }));
  },

  deleteItemLocal: (itemId) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== itemId),
    }));
  },
}));
