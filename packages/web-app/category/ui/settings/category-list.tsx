import { FC } from "react";

import { CategoryVM } from "../../models/category.vm";
import { CategoryListItem } from "./category-list-item";

type CategoriesListProps = {
  categories: ReadonlyArray<CategoryVM>;
  onCategoryDelete: () => void;
};

export const CategoryList: FC<CategoriesListProps> = ({ categories, onCategoryDelete }) => {
  return (
    <ol className="flex flex-col gap-2">
      {categories.map((category) => {
        return (
          <li key={category.id}>
            <CategoryListItem category={category} onCategoryDelete={() => onCategoryDelete()} />
          </li>
        );
      })}
    </ol>
  );
};
