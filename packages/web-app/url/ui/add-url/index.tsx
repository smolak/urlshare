import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "@urlshare/db/prisma/client";
import { Button } from "@urlshare/ui/design-system/ui/button";
import { Input } from "@urlshare/ui/design-system/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@urlshare/ui/design-system/ui/popover";
import { cn } from "@urlshare/ui/utils";
import { CheckCircle, Plus } from "lucide-react";
import React, { FC, useCallback, useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";

import { CategoryVM } from "../../../category/models/category.vm";
import { AddCategory } from "../../../category/ui/add-category";
import { CategoryPicker } from "../../../category/ui/category-picker";
import { api } from "../../../trpc/client";
import { CreateUrlSchema, createUrlSchema } from "../../router/procedures/create-url.schema";

type AddUrlProps = {
  categories: ReadonlyArray<CategoryVM>;
  onCategoryAdd: () => void;
};

export const AddUrl: FC<AddUrlProps> = ({ categories, onCategoryAdd }) => {
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

  const onCategorySelectionChange = useCallback(
    (categoryId: Category["id"]) => {
      const categoryListed = selectedCategories.indexOf(categoryId) !== -1;
      const newSelection = categoryListed
        ? selectedCategories.filter((id) => categoryId !== id)
        : [...selectedCategories, categoryId];

      setSelectedCategories(newSelection);
    },
    [selectedCategories, setSelectedCategories]
  );

  const label = selectedCategories.length > 0 ? `Categories (${selectedCategories.length})` : "Categories";

  return (
    <section className="w-full">
      <div className="flex items-center gap-2">
        <form onSubmit={handleSubmit(onSubmit)} id="add-url" className="grow">
          <Input
            {...register("url")}
            type="url"
            inputMode="url"
            disabled={isLoading}
            placeholder="https://..."
            className="bg-white"
            onBlur={() => {
              setErrorResponse("");

              const { url } = getValues();

              if (url === "") {
                resetField("url");
              }
            }}
          />
        </form>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[140px] bg-white hover:bg-slate-50">
              {label}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-4 max-md:p-3 md:w-[318px]">
            <CategoryPicker
              description="Pick one ore more, they're optional"
              categories={categories}
              selectedCategories={selectedCategories}
              onCategorySelectionChange={onCategorySelectionChange}
            />
            <AddCategory onCategoryAdd={onCategoryAdd} size="small" />
          </PopoverContent>
        </Popover>
        <Button form="add-url" type="submit" disabled={isLoading} className={cn("h-9 gap-1", { loading: isLoading })}>
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
    </section>
  );
};
