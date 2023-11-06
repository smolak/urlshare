import { Category } from "@urlshare/db/prisma/client";
import { Button } from "@urlshare/ui/design-system/ui/button";
import { Checkbox } from "@urlshare/ui/design-system/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@urlshare/ui/design-system/ui/popover";
import React, { FC } from "react";

import { api } from "../../../trpc/client";
import { ErrorLoadingCategories } from "./error-loading-categories";
import { LoadingCategories } from "./loading-categories";

type CategoryPickerProps = {
  selectedCategories: Category["id"][];
  onCategorySelectionChange: (id: Category["id"]) => void;
};

export const CategoryPicker: FC<CategoryPickerProps> = ({ selectedCategories, onCategorySelectionChange }) => {
  const { data, isLoading, isSuccess, isRefetching, isError, refetch } = api.category.getMyCategories.useQuery();
  const label = selectedCategories.length > 0 ? `Categories (${selectedCategories.length})` : "Categories";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[140px]">
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="md:w-[420px]">
        {isLoading || isRefetching ? <LoadingCategories /> : null}
        {isError ? <ErrorLoadingCategories onLoadCategoriesClick={() => refetch()} /> : null}
        {isSuccess ? (
          <section className="flex flex-col gap-3">
            <header>
              <h3 className="text-sm text-gray-500">Pick one or more. They are optional.</h3>
            </header>
            <ul className="flex flex-col gap-3">
              {data.map(({ id, name, urlsCount }) => {
                return (
                  <li className="flex items-center space-x-2" key={id}>
                    <Checkbox
                      id={id}
                      className="border-slate-800"
                      checked={selectedCategories.indexOf(id) !== -1}
                      onCheckedChange={() => onCategorySelectionChange(id)}
                    />
                    <label
                      htmlFor={id}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {name} ({urlsCount})
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};
