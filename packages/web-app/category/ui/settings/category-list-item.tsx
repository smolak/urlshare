import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@urlshare/ui/design-system/ui/tooltip";
import { Pencil, Trash2 } from "lucide-react";
import React, { FC, useState } from "react";

import { CategoryVM } from "../../models/category.vm";
import { ActionButton } from "./action-button";
import { DeleteCategory } from "./delete-category";
import { EditCategory } from "./edit-category";

type CategoryListItemProps = {
  category: CategoryVM;
  onCategoryDelete: () => void;
};

type CrudState = "idle" | "edit" | "delete";

export const CategoryListItem: FC<CategoryListItemProps> = ({ category, onCategoryDelete }) => {
  const [categoryName, setCategoryName] = useState(category.name);
  const [state, setState] = useState<CrudState>("idle");

  if (state === "edit") {
    return (
      <EditCategory
        category={{ ...category, name: categoryName }}
        onSave={(newName) => {
          setCategoryName(newName);
          setState("idle");
        }}
        onCancel={() => setState("idle")}
      />
    );
  }

  if (state === "delete") {
    return <DeleteCategory category={category} onDelete={() => onCategoryDelete()} onCancel={() => setState("idle")} />;
  }

  return (
    <span className="space-between border-1 flex h-[42px] items-center justify-between rounded-md border border-transparent px-1 transition-all hover:bg-slate-50">
      <span className="flex w-full items-center gap-2" onDoubleClick={() => setState("edit")}>
        <span className="p-2">{categoryName}</span>
        {category.urlsCount > 0 ? (
          <span title="Number of URLs for this category" className="font-extralight text-slate-600">
            ({category.urlsCount})
          </span>
        ) : null}
      </span>
      <span className="flex text-gray-600">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <ActionButton onClick={() => setState("edit")} className="group hover:bg-sky-100">
                <Pencil size={14} className="group-hover:text-sky-600" />
              </ActionButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit category name.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <ActionButton onClick={() => setState("delete")} className="group hover:bg-red-100">
                <Trash2 size={14} className="group-hover:text-red-600" />
              </ActionButton>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete?</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </span>
    </span>
  );
};
