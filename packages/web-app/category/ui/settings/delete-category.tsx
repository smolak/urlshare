import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@urlshare/ui/design-system/ui/input";
import { cn } from "@urlshare/ui/utils";
import { Info, Trash } from "lucide-react";
import React, { FC, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { api } from "../../../trpc/client";
import { DeleteCategorySchema, deleteCategorySchema } from "../../router/procedures/delete-category.schema";
import { CategoryVM } from "../../types/category.vm";
import { ActionPending } from "./action-pending";
import { CancelAction } from "./cancel-action";
import { StickyErrorMessage } from "./sticky-error-message";
import { SubmitButton } from "./submit-button";

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
            <ActionPending />
          ) : (
            <SubmitButton isSubmitting={isLoading}>
              <Trash size={14} />
            </SubmitButton>
          )}
          <CancelAction actionPending={isLoading} onCancelAction={onCancel} />
        </div>

        <Input {...register("id")} type="hidden" />
      </div>
      {errorResponse !== "" ? <StickyErrorMessage>{errorResponse}</StickyErrorMessage> : null}
    </form>
  );
};
