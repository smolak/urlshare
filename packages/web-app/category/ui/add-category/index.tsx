import React, { FC, useCallback, useState } from "react";
import { FieldValues } from "react-hook-form";

import { api } from "../../../trpc/client";
import { AddCategoryForm, type Size } from "./add-category-form";

type AddCategoryProps = {
  onCategoryAdd: () => void;
  size?: Size;
};

export const AddCategory: FC<AddCategoryProps> = ({ onCategoryAdd, size = "default" }) => {
  const [errorResponse, setErrorResponse] = useState("");

  const {
    mutate: addCategory,
    isLoading,
    isSuccess,
  } = api.category.createCategory.useMutation({
    onSuccess: () => {
      setErrorResponse("");
      onCategoryAdd();
    },
    onError: (error) => {
      setErrorResponse(error.message);
    },
  });

  const onSubmit = useCallback(
    (values: FieldValues) => {
      const name = values.name as string;

      addCategory({ name });
    },
    [addCategory]
  );

  const onBlur = useCallback(() => {
    setErrorResponse("");
  }, [setErrorResponse]);

  return (
    <AddCategoryForm
      onSubmit={onSubmit}
      onBlur={onBlur}
      isSubmitting={isLoading}
      size={size}
      errorResponse={errorResponse}
      resetForm={isSuccess}
    />
  );
};
