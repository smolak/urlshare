import { User } from "@prisma/client";
import { Lightbulb } from "lucide-react";
import { FC } from "react";

import { api } from "../../../trpc/client";
import { AddCategory } from "../add-category";
import { CategoryList } from "./category-list";
import { ErrorLoadingCategories } from "./error-loading-categories";
import { LoadingCategories } from "./loading-categories";

type CategoriesSettingsProps = {
  userId: User["id"];
};

export const CategoriesSettings: FC<CategoriesSettingsProps> = ({ userId }) => {
  const { data, isLoading, isError, refetch } = api.category.getUserCategories.useQuery({ userId });

  if (isLoading) {
    return <LoadingCategories />;
  }

  if (isError) {
    return <ErrorLoadingCategories />;
  }

  return (
    <div className="flex flex-col gap-6 md:max-w-[450px]">
      <AddCategory onCategoryAdd={() => refetch()} />
      <div className="flex flex-col gap-2">
        {data.length > 0 ? (
          <p className="flex items-center gap-2 rounded rounded-md border-l-4 border-yellow-500 bg-slate-50 px-2 py-1 text-sm text-slate-600">
            <Lightbulb size={13} strokeWidth={2.5} className="text-yellow-500" />
            <span className="font-light">Double-click to edit. Escape to cancel.</span>
          </p>
        ) : null}
        <CategoryList categories={data} onCategoryDelete={() => refetch()} />
      </div>
    </div>
  );
};
