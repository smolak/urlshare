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
    <ul className={cn("flex flex-col gap-2", className)}>
      {categories.map(({ id, name, urlsCount, selected }) => {
        return (
          <li className="flex items-center space-x-2" key={id}>
            <Checkbox
              id={id}
              className="scale-85 border-slate-800"
              checked={selected}
              onCheckedChange={() => onCategorySelectionChange(id)}
            />
            <label
              htmlFor={id}
              className="flex cursor-pointer gap-2 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {name}
              {urlsCount > 0 ? (
                <span title="Number of URLs for this category" className="font-extralight text-slate-600">
                  ({urlsCount})
                </span>
              ) : null}
            </label>
          </li>
        );
      })}
    </ul>
  );
};
