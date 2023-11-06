import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "@urlshare/db/prisma/client";
import { Button } from "@urlshare/ui/design-system/ui/button";
import { Input } from "@urlshare/ui/design-system/ui/input";
import { cn } from "@urlshare/ui/utils";
import { CheckCircle, Plus } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";

import { CategoryPicker } from "../../../category/ui/category-picker";
import { api } from "../../../trpc/client";
import { CreateUrlSchema, createUrlSchema } from "../../router/procedures/create-url.schema";

export const AddUrl = () => {
  const {
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    resetField,
    setFocus,
  } = useForm<CreateUrlSchema>({
    resolver: zodResolver(createUrlSchema),
    mode: "onSubmit",
  });

  const [errorResponse, setErrorResponse] = useState("");
  const [addedUrl, setAddedUrl] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category["id"][]>([]);

  const { mutate: addUrl, isLoading } = api.url.createUrl.useMutation({
    onSuccess: (data) => {
      setAddedUrl(data.url);
      setSelectedCategories([]);
      resetField("url");
      setFocus("url");
    },
    onError: (error) => {
      setErrorResponse(error.message);
    },
  });

  useEffect(() => {
    setFocus("url");
  }, [setFocus]);

  useEffect(() => {
    if (errorResponse !== "") {
      setFocus("url");
    }
  }, [setFocus, errorResponse]);

  useEffect(() => {
    if (addedUrl !== "") {
      const timeout = setTimeout(() => {
        setAddedUrl("");
      }, 5_000);

      return () => clearTimeout(timeout);
    }
  }, [addedUrl, setAddedUrl]);

  const onSubmit = useCallback(
    (values: FieldValues) => {
      setAddedUrl("");
      const url = values.url as string;

      addUrl({ url, categoryIds: selectedCategories });
    },
    [setAddedUrl, addUrl, selectedCategories]
  );

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="relative">
        <div className="flex items-center gap-2">
          <Input
            {...register("url")}
            type="url"
            inputMode="url"
            disabled={isLoading}
            placeholder="https://..."
            className="max-w-md"
            onBlur={() => {
              setErrorResponse("");

              const { url } = getValues();

              if (url === "") {
                resetField("url");
              }
            }}
          />
          <CategoryPicker
            selectedCategories={selectedCategories}
            onCategorySelectionChange={(categoryId) => {
              const categoryListed = selectedCategories.indexOf(categoryId) !== -1;
              const newSelection = categoryListed
                ? selectedCategories.filter((id) => categoryId !== id)
                : [...selectedCategories, categoryId];

              setSelectedCategories(newSelection);
            }}
          />
          <Button type="submit" disabled={isLoading} className={cn("h-9 gap-1", { loading: isLoading })}>
            <Plus size={18} />
            <span>Add</span>
          </Button>
        </div>
        {errors?.url?.message || errorResponse !== "" ? (
          <p className="absolute mt-1 rounded rounded-md bg-red-50 px-2 py-1 text-sm text-red-600">
            {errors?.url?.message || errorResponse}
          </p>
        ) : null}
        {addedUrl !== "" && (
          <p
            className="absolute mt-1 rounded rounded-md bg-green-50 px-2 py-1 text-sm text-green-600"
            onClick={() => setAddedUrl("")}
          >
            <span className="flex items-center gap-2">
              <CheckCircle size={13} />
              <span>URL added. It will be live soon.</span>
            </span>
          </p>
        )}
      </form>
    </div>
  );
};
