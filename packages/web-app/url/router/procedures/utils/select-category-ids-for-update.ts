import { CategoryId } from "../../../../category/schemas/category-id.schema";

export const selectCategoryIdsForUpdate = ({
  currentCategoryIds,
  newCategoryIds,
}: {
  currentCategoryIds: CategoryId[];
  newCategoryIds: CategoryId[];
}) => {
  const increment = newCategoryIds.filter((id) => currentCategoryIds.indexOf(id) === -1);
  const decrement = currentCategoryIds.filter((id) => newCategoryIds.indexOf(id) === -1);

  return {
    increment,
    decrement,
  };
};
