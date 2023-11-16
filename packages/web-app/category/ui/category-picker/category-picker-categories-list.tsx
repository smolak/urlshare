import { Checkbox } from "@urlshare/ui/design-system/ui/checkbox";
import { cn } from "@urlshare/ui/utils";
import React, { FC } from "react";

import { CategoryVM } from "../../models/category.vm";

type CategoryPickerCategory = CategoryVM & { selected: boolean };

type CategoryPickerCategoriesListProps = {
  className?: string;
  categories: ReadonlyArray<CategoryPickerCategory>;
  onCategorySelectionChange: (id: CategoryVM["id"]) => void;
};

export const CategoryPickerCategoriesList: FC<CategoryPickerCategoriesListProps> = ({
  className,
  categories,
  onCategorySelectionChange,
}) => {
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {categories.map(({ id, name, urlsCount, selected }) => {
        return (
          <li className="flex items-center space-x-2" key={id}>
            <Checkbox
              id={id}
              className="border-slate-800"
              checked={selected}
              onCheckedChange={() => onCategorySelectionChange(id)}
            />
            <label
              htmlFor={id}
              className="cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {name} (<span title="Number of URLs for this category">{urlsCount}</span>)
            </label>
          </li>
        );
      })}
    </ul>
  );
};
