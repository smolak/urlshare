import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@urlshare/ui/design-system/ui/button";
import { Input } from "@urlshare/ui/design-system/ui/input";
import { cn } from "@urlshare/ui/utils";
import { Plus } from "lucide-react";
import React, { FC, useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";

import { api } from "../../../trpc/client";
import { CreateCategorySchema, createCategorySchema } from "../../router/procedures/create-category.schema";

type Size = "default" | "small";

type AddCategoryProps = {
  onCategoryAdd: () => void;
  size?: Size;
};

export const AddCategory: FC<AddCategoryProps> = ({ onCategoryAdd, size = "default" }) => {
  const [errorResponse, setErrorResponse] = useState("");
  const {
    setFocus,
    register,
    handleSubmit,
    resetField,
    getValues,
    formState: { errors },
  } = useForm<CreateCategorySchema>({
    resolver: zodResolver(createCategorySchema),
    mode: "onChange",
  });
  const { mutate: addCategory, isLoading } = api.category.createCategory.useMutation({
    onSuccess: () => {
      setErrorResponse("");
      resetField("name");
      onCategoryAdd();
    },
    onError: (error) => {
      setErrorResponse(error.message);
    },
  });

  useEffect(() => {
    if (errorResponse !== "") {
      setFocus("name");
    }
  }, [setFocus, errorResponse]);

  const onSubmit = (values: FieldValues) => {
    const name = values.name as string;

    addCategory({ name });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="categories">
      <div className="flex items-center gap-2">
        <Input
          {...register("name")}
          type="text"
          inputMode="text"
          disabled={isLoading}
          onBlur={() => {
            setErrorResponse("");

            const { name } = getValues();

            if (name === "") {
              resetField("name");
            }
          }}
          className={cn({ "h-8": size === "small" })}
        />
        <Button
          type="submit"
          form="categories"
          disabled={isLoading}
          className={cn("h-9 gap-1", { loading: isLoading, "h-8": size === "small" })}
        >
          <Plus size={18} />
          <span>Add</span>
        </Button>
      </div>
      {errors?.name?.message || errorResponse !== "" ? (
        <p className="absolute mt-1 rounded rounded-md bg-red-50 px-2 py-1 text-sm text-red-600">
          {errors?.name?.message || errorResponse}
        </p>
      ) : null}
    </form>
  );
};
