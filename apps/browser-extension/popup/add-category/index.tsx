import { AddCategoryForm } from "@urlshare/web-app/category/ui/add-category/add-category-form";
import { type FC, useCallback } from "react";
import type { FieldValues } from "react-hook-form";

import { useAddCategory } from "~popup/hooks/use-add-category";

type AddCategoryProps = {
  apiKey: string;
  onSuccess: () => void;
};

export const AddCategory: FC<AddCategoryProps> = ({ apiKey, onSuccess }) => {
  const { mutate, isLoading, isSuccess, isError, reset } = useAddCategory(apiKey, onSuccess);

  const addCategory = useCallback(
    (values: FieldValues) => {
      const name = values.name as string;

      mutate({ name });
    },
    [mutate]
  );

  const onBlur = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <AddCategoryForm
      onSubmit={addCategory}
      onBlur={onBlur}
      isSubmitting={isLoading}
      size="small"
      resetForm={isSuccess}
      errorResponse={isError && "Could not add category, try again."}
    />
  );
};
