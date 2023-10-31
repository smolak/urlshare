import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@urlshare/ui/design-system/ui/input";
import { cn } from "@urlshare/ui/utils";
import { Ban, Loader2, Save } from "lucide-react";
import React, { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { api } from "../../../trpc/client";
import { UpdateCategorySchema, updateCategorySchema } from "../../router/procedures/update-category.schema";
import { CategoryVM } from "../../types/category.vm";

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
              <Save size={14} />
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
      {errors?.name?.message || errorResponse !== "" ? (
        <p className="absolute rounded rounded-md rounded-t-none bg-red-50 px-2 py-1 text-sm text-red-600">
          {errors?.name?.message || errorResponse}
        </p>
      ) : null}
    </form>
  );
};
