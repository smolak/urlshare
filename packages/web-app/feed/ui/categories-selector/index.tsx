import { Category } from "@urlshare/db/prisma/client";
import { Button } from "@urlshare/ui/design-system/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@urlshare/ui/design-system/ui/dropdown-menu";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import qs from "qs";
import React, { FC, useCallback } from "react";

import { CategoryVM } from "../../../category/models/category.vm";
import { CategoryPickerCategoriesList } from "../../../category/ui/category-picker/category-picker-categories-list";

type CategoriesSelectorProps = {
  categories: ReadonlyArray<CategoryVM>;
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

export const CategoriesSelector: FC<CategoriesSelectorProps> = ({ categories }) => {
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
        <Button variant="outline" className="w-[140px]">
          {buttonLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
