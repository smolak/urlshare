import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@urlshare/ui/design-system/ui/button";
import { Input } from "@urlshare/ui/design-system/ui/input";
import { cn } from "@urlshare/ui/utils";
import { api } from "@urlshare/web-app/trpc/client";
import { Plus } from "lucide-react";
import React, { FC, useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";

import { CreateCategorySchema, createCategorySchema } from "../../router/procedures/create-category.schema";

type AddCategoryProps = {
  onCategoryAdd: () => void;
};

export const AddCategory: FC<AddCategoryProps> = ({ onCategoryAdd }) => {
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
    <form onSubmit={handleSubmit(onSubmit)}>
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
        />
        <Button type="submit" disabled={isLoading} className={cn("h-9 gap-1", { loading: isLoading })}>
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
