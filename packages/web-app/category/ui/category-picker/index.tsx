import { Category } from "@urlshare/db/prisma/client";
import { Button } from "@urlshare/ui/design-system/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@urlshare/ui/design-system/ui/popover";
import { Settings } from "lucide-react";
import Link from "next/link";
import React, { FC } from "react";

import { CategoryVM } from "../../models/category.vm";
import { AddCategory } from "../add-category";
import { CategoryPickerCategoriesList } from "./category-picker-categories-list";

type CategoryPickerProps = {
  categories: ReadonlyArray<CategoryVM>;
  onCategoryAdd: () => void;
  selectedCategories: Category["id"][];
  onCategorySelectionChange: (id: Category["id"]) => void;
};

export const CategoryPicker: FC<CategoryPickerProps> = ({
  categories,
  selectedCategories,
  onCategoryAdd,
  onCategorySelectionChange,
}) => {
  const label = selectedCategories.length > 0 ? `Categories (${selectedCategories.length})` : "Categories";
  const categoryPickerCategories = categories.map((category) => {
    return {
      ...category,
      selected: selectedCategories.indexOf(category.id) >= 0,
    };
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[140px] bg-white hover:bg-slate-50">
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-md:p-3 md:w-[420px]">
        <section className="flex flex-col gap-4">
          <header className="flex items-center justify-between">
            <h3 className="text-xs font-light text-slate-400">Pick one or more. They are optional.</h3>
            <span className="flex items-center gap-2">
              <Link href="/settings/categories" className="cursor-pointer rounded p-1.5 hover:bg-slate-100">
                <Settings size={14} className="text-slate-400" />
              </Link>
            </span>
          </header>
          <CategoryPickerCategoriesList
            categories={categoryPickerCategories}
            onCategorySelectionChange={onCategorySelectionChange}
          />
          <AddCategory onCategoryAdd={onCategoryAdd} size="small" />
        </section>
      </PopoverContent>
    </Popover>
  );
};
