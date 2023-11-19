import { Button } from "@urlshare/ui/design-system/ui/button";
import { LoadingIndicator } from "@urlshare/ui/design-system/ui/loading-indicator";
import { Separator } from "@urlshare/ui/design-system/ui/separator";
import type { CategoryVM } from "@urlshare/web-app/category/models/category.vm";
import { CategoryPicker } from "@urlshare/web-app/category/ui/category-picker";
import { Check } from "lucide-react";
import React, { type FC, useCallback, useState } from "react";

import { AddCategory } from "../add-category";
import { useAddUrl } from "../hooks/use-add-url";
import { useCategories } from "../hooks/use-categories";

type AddUrlProps = {
  apiKey: string;
  url: string;
};

export const AddUrl: FC<AddUrlProps> = ({ apiKey, url }) => {
  const { mutate, isLoading, isSuccess, isError } = useAddUrl(apiKey);
  const { data: categories, isSuccess: categoriesLoaded, refetch } = useCategories(apiKey);

  const [selectedCategories, setSelectedCategories] = useState([]);

  const onCategorySelectionChange = useCallback(
    (categoryId: CategoryVM["id"]) => {
      const categoryListed = selectedCategories.indexOf(categoryId) !== -1;
      const newSelection = categoryListed
        ? selectedCategories.filter((id) => categoryId !== id)
        : [...selectedCategories, categoryId];

      setSelectedCategories(newSelection);
    },
    [selectedCategories, setSelectedCategories]
  );

  const addUrl = useCallback(() => {
    mutate({ url, categoryIds: selectedCategories });
  }, [mutate, url, selectedCategories]);

  return (
    <div className="flex flex-col gap-4 p-2">
      {categoriesLoaded &&
        (categories.length > 0 ? (
          <div>
            <h2 className="text-lg font-medium">Categories</h2>
            <CategoryPicker
              description="optional"
              categories={categories}
              selectedCategories={selectedCategories}
              onCategorySelectionChange={onCategorySelectionChange}
              showSettingsLink={false}
            />
          </div>
        ) : (
          <div className="text-sm">No categories. Add some.</div>
        ))}

      <AddCategory apiKey={apiKey} onSuccess={() => refetch()} />
      <Separator />

      {isError && <div>Could not add, try again.</div>}

      <div className="flex items-center gap-2">
        <Button onClick={addUrl} disabled={isLoading}>
          Add URL
        </Button>
        {isLoading ? <LoadingIndicator label="Adding the URL" className="text-gray-500" size={18} /> : null}
        {isSuccess ? <Check className="text-green-700" /> : null}
      </div>

      <p className="overflow-hidden text-ellipsis text-xs font-extralight">{url}</p>
    </div>
  );
};
