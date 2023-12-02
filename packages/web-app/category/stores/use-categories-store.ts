import { create } from "zustand";

import { CategoryVM } from "../models/category.vm";

interface CategoriesState {
  categories: CategoryVM[];
  shouldRefetchCategories: boolean;
  refetchCategories: () => void;
  setShouldRefetchCategories: (value: boolean) => void;
  setCategories: (categories: CategoryVM[]) => void;
}

export const useCategoriesStore = create<CategoriesState>()((set) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
  shouldRefetchCategories: false,
  setShouldRefetchCategories: (value) => set(() => ({ shouldRefetchCategories: value })),
  refetchCategories: () => set({ shouldRefetchCategories: true }),
}));
