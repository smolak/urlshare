import { Category } from "@urlshare/db/prisma/client";
import { Button } from "@urlshare/ui/design-system/ui/button";
import { Checkbox } from "@urlshare/ui/design-system/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@urlshare/ui/design-system/ui/popover";
import { Settings } from "lucide-react";
import Link from "next/link";
import React, { FC } from "react";

import { api } from "../../../trpc/client";
import { AddCategory } from "../add-category";
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
      <PopoverContent className="max-md:p-3 md:w-[420px]">
        {isError ? <ErrorLoadingCategories onLoadCategoriesClick={() => refetch()} /> : null}
        {isSuccess ? (
          <section className="flex flex-col gap-4">
            <header className="flex items-center justify-between">
              <h3 className="text-xs font-light text-slate-400">Pick one or more. They are optional.</h3>
              <span className="flex items-center gap-2">
                {isLoading || isRefetching ? <LoadingCategories size="small" variant="light" /> : null}
                <Link href="/settings/categories" className="cursor-pointer rounded p-1.5 hover:bg-slate-100">
                  <Settings size={14} className="text-slate-400" />
                </Link>
              </span>
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
                      {name} (<span title="Number of URLs for this category">{urlsCount}</span>)
                    </label>
                  </li>
                );
              })}
            </ul>
            <AddCategory onCategoryAdd={() => refetch()} size="small" />
          </section>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};
