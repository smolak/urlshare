import { api } from "../../../trpc/client";
import { AddCategory } from "./add-category";
import { CategoryList } from "./category-list";
import { ErrorLoadingCategories } from "./error-loading-categories";
import { LoadingCategories } from "./loading-categories";

export const CategoriesSettings = () => {
  const { data, isLoading, isError, refetch } = api.category.getMyCategories.useQuery();

  if (isLoading) {
    return <LoadingCategories />;
  }

  if (isError) {
    return <ErrorLoadingCategories />;
  }

  return (
    <div className="flex flex-col gap-3 md:max-w-[450px]">
      <CategoryList categories={data} onCategoryDelete={() => refetch()} />
      <AddCategory onCategoryAdd={() => refetch()} />
    </div>
  );
};
