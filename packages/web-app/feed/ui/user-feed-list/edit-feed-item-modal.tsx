import { Category } from "@urlshare/db/prisma/client";
import { Button } from "@urlshare/ui/design-system/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@urlshare/ui/design-system/ui/dialog";
import { cn } from "@urlshare/ui/utils";
import { FC, useCallback, useEffect, useState } from "react";

import { CategoryVM } from "../../../category/models/category.vm";
import { GetUserUrlCategoriesReturnType } from "../../../category/router/procedures/get-user-url-categories";
import { useCategoriesStore } from "../../../category/stores/use-categories-store";
import { CategoryPickerCategoriesList } from "../../../category/ui/category-picker/category-picker-categories-list";
import { api } from "../../../trpc/client";
import { LoadingIndicator } from "../../../ui/loading-indicator";
import { FeedVM } from "../../models/feed.vm";

export type OnSuccess = (categoryNames: Category["name"][]) => void;

type EditFeedItemProps = {
  open: boolean;
  onOpenChange: (newOpenValue: boolean) => void;
  onSuccess: OnSuccess;
  feedItem: FeedVM;
};

const prepareCategories = ({
  userCategories,
  selectedCategoryIds,
}: {
  userCategories: CategoryVM[];
  selectedCategoryIds: CategoryVM["id"][];
}) =>
  userCategories.map((category) => ({
    ...category,
    selected: selectedCategoryIds.indexOf(category.id) >= 0,
  }));

const getCategoryIds = (userUrlCategories: GetUserUrlCategoriesReturnType) =>
  userUrlCategories.map(({ categoryId }) => categoryId);

export const EditFeedItemModal: FC<EditFeedItemProps> = ({ open, onOpenChange, feedItem, onSuccess }) => {
  const userCategories = useCategoriesStore(({ categories }) => categories);
  const setShouldRefetchCategories = useCategoriesStore(({ setShouldRefetchCategories }) => setShouldRefetchCategories);
  const {
    data,
    isLoading: loadingCategories,
    isSuccess: categoriesLoaded,
    isError: errorLoadingCategories,
  } = api.category.getUserUrlCategories.useQuery({
    userUrlId: feedItem.userUrlId,
  });
  const {
    mutate: updateUserUrl,
    isLoading: updatingUserUrl,
    isSuccess: updatedUserUrl,
    isError: errorUpdatingUserUrl,
  } = api.url.updateUserUrl.useMutation();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const onCategorySelectionChange = useCallback(
    (categoryId: Category["id"]) => {
      const categoryListed = selectedCategoryIds.indexOf(categoryId) !== -1;
      const newSelection = categoryListed
        ? selectedCategoryIds.filter((id) => categoryId !== id)
        : [...selectedCategoryIds, categoryId];

      setSelectedCategoryIds(newSelection);
    },
    [selectedCategoryIds, setSelectedCategoryIds]
  );

  useEffect(() => {
    if (categoriesLoaded) {
      setSelectedCategoryIds(getCategoryIds(data));
    }
  }, [categoriesLoaded, data, setSelectedCategoryIds]);

  useEffect(() => {
    if (updatedUserUrl) {
      const newUserUrlCategories = userCategories
        .filter((category) => selectedCategoryIds.indexOf(category.id) !== -1)
        .map(({ name }) => name);

      onSuccess(newUserUrlCategories);
      setShouldRefetchCategories(true);
    }
  }, [updatedUserUrl, onSuccess, selectedCategoryIds, userCategories, setShouldRefetchCategories]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Url</DialogTitle>
          <DialogDescription>Right now only categories are editable.</DialogDescription>
        </DialogHeader>
        {loadingCategories ? <LoadingIndicator label="Loading categories..." /> : null}
        {errorLoadingCategories ? <div>Could not load the categories, try again.</div> : null}
        {categoriesLoaded ? (
          <CategoryPickerCategoriesList
            categories={prepareCategories({ userCategories, selectedCategoryIds })}
            onCategorySelectionChange={onCategorySelectionChange}
          />
        ) : null}
        {errorUpdatingUserUrl ? (
          <p className="rounded rounded-md bg-red-50 px-2 py-1 text-sm text-red-600">
            Could not update Url, try again.
          </p>
        ) : null}
        <DialogFooter>
          <Button
            type="submit"
            onClick={() =>
              updateUserUrl({
                userUrlId: feedItem.userUrlId,
                categoryIds: selectedCategoryIds,
              })
            }
            disabled={updatedUserUrl}
            className={cn({ loading: updatingUserUrl })}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
