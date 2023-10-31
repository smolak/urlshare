import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@urlshare/ui/design-system/ui/input";
import { cn } from "@urlshare/ui/utils";
import { Ban, Info, Loader2, Trash } from "lucide-react";
import React, { FC, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { api } from "../../../trpc/client";
import { DeleteCategorySchema, deleteCategorySchema } from "../../router/procedures/delete-category.schema";
import { CategoryVM } from "../../types/category.vm";

type EditCategoryProps = {
  category: CategoryVM;
  onDelete: () => void;
  onCancel: () => void;
};

export const DeleteCategory: FC<EditCategoryProps> = ({ category, onDelete, onCancel }) => {
  const [errorResponse, setErrorResponse] = useState("");
  const { register, handleSubmit } = useForm<DeleteCategorySchema>({
    resolver: zodResolver(deleteCategorySchema),
    mode: "onChange",
    defaultValues: {
      id: category.id,
    },
  });

  const { mutate: deleteCategory, isLoading } = api.category.deleteCategory.useMutation({
    onSuccess: () => {
      onDelete();
    },
    onError: () => {
      setErrorResponse("Could not delete, try again.");
    },
  });

  const abort = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    },
    [onCancel]
  );

  useEffect(() => {
    document.addEventListener("keyup", abort);

    return () => {
      document.removeEventListener("keyup", abort);
    };
  }, [abort]);

  const onSubmit = (data: DeleteCategorySchema) => {
    setErrorResponse("");
    deleteCategory(data);
  };

  return (
    <form className="relative" onSubmit={handleSubmit(onSubmit)}>
      <p className="absolute -top-8 rounded rounded-md bg-blue-50 px-2 py-1 text-sm text-blue-600">
        <span className="flex items-center gap-2">
          <Info size={13} /> No URLs will be removed with this operation.
        </span>
      </p>
      <div
        className={cn(
          "border-1 text-accent-foreground space-between flex h-[42px] items-center justify-between rounded-md border px-1 shadow shadow-sm transition-all",
          { "rounded-bl-none border-red-50": Boolean(errorResponse) }
        )}
      >
        <span className="w-full p-2">{category.name}</span>

        <div className="flex">
          {isLoading ? (
            <span className="flex h-[32px] w-[32px] items-center justify-center">
              <Loader2 className="animate-spin cursor-progress" size={14} />
            </span>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-[32px] w-[32px] items-center justify-center rounded rounded-md hover:bg-green-100"
            >
              <Trash size={14} />
            </button>
          )}
          <button
            type="button"
            onClick={() => onCancel()}
            disabled={isLoading}
            className="border-1 flex h-[31px] w-[31px] items-center justify-center rounded rounded-md border-gray-200 hover:border"
          >
            <Ban size={14} />
          </button>
        </div>

        <Input {...register("id")} type="hidden" />
      </div>
      {errorResponse !== "" ? (
        <p className="absolute rounded rounded-md rounded-t-none bg-red-50 px-2 py-1 text-sm text-red-600">
          {errorResponse}
        </p>
      ) : null}
    </form>
  );
};
