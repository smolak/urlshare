import { UserProfileData } from "@prisma/client";
import { FC } from "react";

import { CategoryVM } from "../../../category/models/category.vm";
import { CategoriesSelector } from "../categories-selector";
import { UserFeedSourceSelector } from "../user-feed-source-selector";

type FeedListFiltersProps = {
  username: UserProfileData["username"];
  categories: ReadonlyArray<CategoryVM>;
};

export const FeedListFilters: FC<FeedListFiltersProps> = ({ username, categories }) => {
  return (
    <aside className="flex justify-between">
      <UserFeedSourceSelector author={username} />
      <CategoriesSelector categories={categories} />
    </aside>
  );
};
