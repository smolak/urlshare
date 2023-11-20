import { Category } from "@urlshare/db/prisma/client";
import { createPossessiveForm } from "@urlshare/shared/utils/create-possessive-form";
import { Button } from "@urlshare/ui/design-system/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@urlshare/ui/design-system/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@urlshare/ui/design-system/ui/popover";
import { Info } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import qs from "qs";
import React, { FC, useCallback } from "react";

import { CategoryVM } from "../../../category/models/category.vm";
import { CategoryPickerCategoriesList } from "../../../category/ui/category-picker/category-picker-categories-list";

type CategoriesSelectorProps = {
  categories: ReadonlyArray<CategoryVM>;
  author: string;
};

const createExplanation = (username: string) => {
  if (username === "Me") {
    return "Filtering by category will narrow down your URLs only, as categories are not shared, they are yours.";
  }

  return `Filtering by categories will narrow down ${createPossessiveForm(
    username
  )} URLs only, as categories are not shared.`;
};

const getSelectedCategories = (categories: ReadonlyArray<CategoryVM>, searchParams: string): CategoryVM["id"][] => {
  const categoriesString = qs.parse(searchParams).categories;

  // Only one way of passing category IDs is accepted.
  const categoriesInSearchParams = typeof categoriesString === "string" ? categoriesString.split(",") : [];

  return categories
    .filter(({ id }) => {
      return categoriesInSearchParams.indexOf(id) >= 0;
    })
    .map(({ id }) => id);
};

export const CategoriesSelector: FC<CategoriesSelectorProps> = ({ author, categories }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategories = getSelectedCategories(categories, searchParams.toString());
  const allCategoriesChecked = selectedCategories.length === 0;

  const onAllCategoriesClick = useCallback(async () => {
    if (allCategoriesChecked) {
      return;
    }

    const params = new URLSearchParams(searchParams);

    params.delete("categories");

    if (params.toString() === "") {
      await router.push(pathname);
    } else {
      await router.push(pathname + "?" + decodeURIComponent(params.toString()));
    }
  }, [allCategoriesChecked, pathname, router, searchParams]);

  const onCategorySelectionChange = useCallback(
    async (categoryId: Category["id"]) => {
      const params = new URLSearchParams(searchParams);
      let newSelectedCategories = selectedCategories;

      if (selectedCategories.indexOf(categoryId) >= 0) {
        newSelectedCategories = selectedCategories.filter((id) => id !== categoryId);
      } else {
        newSelectedCategories.push(categoryId);
      }

      if (newSelectedCategories.length === 0) {
        params.delete("categories");
      } else {
        // Sorting makes sure that same categories construct same query params order.
        // Good for browser caching.
        params.set("categories", newSelectedCategories.sort().join(","));
      }

      if (params.toString() === "") {
        await router.push(pathname);
      } else {
        await router.push(pathname + "?" + decodeURIComponent(params.toString()));
      }
    },
    [searchParams, selectedCategories, pathname, router]
  );

  const categoryPickerCategories = categories.map((category) => {
    return {
      ...category,
      selected: selectedCategories.indexOf(category.id) >= 0,
    };
  });

  const buttonLabel = selectedCategories.length === 0 ? "Categories" : `Categories (${selectedCategories.length})`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px]">
          {buttonLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {categories.length > 0 ? (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Info size={14} strokeWidth={2.5} className="absolute right-3.5 top-3.5 z-50 cursor-pointer" />
              </PopoverTrigger>
              <PopoverContent className="bg-slate-100 text-sm">{createExplanation(author)}</PopoverContent>
            </Popover>
            <DropdownMenuCheckboxItem
              checked={allCategoriesChecked}
              onClick={onAllCategoriesClick}
              className="cursor-pointer"
            >
              Any category
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <CategoryPickerCategoriesList
              className="p-2"
              categories={categoryPickerCategories}
              onCategorySelectionChange={onCategorySelectionChange}
            />
          </>
        ) : (
          <p className="p-2 text-sm">No categories here, yet</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
