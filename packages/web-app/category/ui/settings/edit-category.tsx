import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@urlshare/ui/design-system/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@urlshare/ui/design-system/ui/tooltip";
import { cn } from "@urlshare/ui/utils";
import { Save } from "lucide-react";
import React, { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { api } from "../../../trpc/client";
import { UpdateCategorySchema, updateCategorySchema } from "../../router/procedures/update-category.schema";
import { CategoryVM } from "../../types/category.vm";
import { ActionPending } from "./action-pending";
import { CancelAction } from "./cancel-action";
import { StickyErrorMessage } from "./sticky-error-message";
import { SubmitButton } from "./submit-button";

type EditCategoryProps = {
  category: CategoryVM;
  onSave: (newName: CategoryVM["name"]) => void;
  onCancel: () => void;
};

export const EditCategory: FC<EditCategoryProps> = ({ category, onSave, onCancel }) => {
  const [errorResponse, setErrorResponse] = useState("");
  const {
    register,
    setFocus,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm<UpdateCategorySchema>({
    resolver: zodResolver(updateCategorySchema),
    mode: "onChange",
    defaultValues: {
      id: category.id,
      name: category.name,
    },
  });

  const { mutate: updateCategory, isLoading } = api.category.updateCategory.useMutation({
    onSuccess: (data) => {
      resetField("name");
      onSave(data.name);
    },
    onError: (error) => {
      setErrorResponse(error.message);
    },
  });

  useEffect(() => {
    setFocus("name");
  }, [setFocus]);

  useEffect(() => {
    if (errorResponse !== "") {
      setFocus("name");
    }
  }, [setFocus, errorResponse]);

  const onSubmit = (data: UpdateCategorySchema) => {
    setErrorResponse("");
    updateCategory(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div
        className={cn(
          "border-1 text-accent-foreground space-between flex h-[42px] items-center justify-between rounded-md border px-1 shadow shadow-sm transition-all",
          { "rounded-bl-none border-red-50": Boolean(errors?.name?.message || errorResponse) }
        )}
      >
        <input
          {...register("name")}
          className="w-full border-0 p-2 outline-none"
          type="text"
          inputMode="text"
          disabled={isLoading}
          onKeyUp={({ key }) => {
            if (key === "Escape") {
              onCancel();
            }
          }}
        />
        <div className="flex text-gray-600">
          {isLoading ? (
            <ActionPending />
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <SubmitButton isSubmitting={isLoading} className="group hover:bg-green-100">
                    <Save size={14} className="group-hover:text-green-600" />
                  </SubmitButton>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save changes.</p>
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
                <p>Discard changes.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Input {...register("id")} type="hidden" />
      </div>
      {errors?.name?.message || errorResponse !== "" ? (
        <StickyErrorMessage>{errors?.name?.message || errorResponse}</StickyErrorMessage>
      ) : null}
    </form>
  );
};
