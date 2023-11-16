import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@urlshare/ui/design-system/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@urlshare/ui/design-system/ui/tooltip";
import { cn } from "@urlshare/ui/utils";
import { Info, Trash } from "lucide-react";
import React, { FC, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { api } from "../../../trpc/client";
import { CategoryVM } from "../../models/category.vm";
import { DeleteCategorySchema, deleteCategorySchema } from "../../router/procedures/delete-category.schema";
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
      <p className="absolute -top-8 rounded rounded-md border-l-4 border-sky-600 bg-sky-50 px-2 py-1 text-sm text-sky-600">
        <span className="flex items-center gap-2">
          <Info size={13} strokeWidth={2.5} />
          <span className="font-light">No URLs will be removed with this operation.</span>
        </span>
      </p>
      <div
        className={cn(
          "border-1 text-accent-foreground space-between flex h-[42px] items-center justify-between rounded-md border border-red-100 px-1 shadow shadow-sm transition-all",
          { "rounded-bl-none border-red-50": Boolean(errorResponse) }
        )}
      >
        <span className="w-full p-2">{category.name}</span>

        <div className="flex text-gray-600">
          {isLoading ? (
            <ActionPending />
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <SubmitButton isSubmitting={isLoading} className="group hover:bg-green-100">
                    <Trash size={14} className="group-hover:text-green-600" />
                  </SubmitButton>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Yes, delete!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <CancelAction actionPending={isLoading} onCancelAction={onCancel} />
              </TooltipTrigger>
              <TooltipContent>
                <p>No, I changed my mind.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Input {...register("id")} type="hidden" />
      </div>
      {errorResponse !== "" ? <StickyErrorMessage>{errorResponse}</StickyErrorMessage> : null}
    </form>
  );
};
