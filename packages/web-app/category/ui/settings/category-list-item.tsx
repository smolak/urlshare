import { Pencil, Trash2 } from "lucide-react";
import { FC, useState } from "react";

import { CategoryVM } from "../../types/category.vm";
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
    <span className="hover:text-accent-foreground space-between border-1 flex h-[42px] items-center justify-between rounded-md border border-transparent px-1 transition-all hover:bg-gray-50">
      <span className="w-full p-2" onDoubleClick={() => setState("edit")}>
        {categoryName}
      </span>
      <span className="flex">
        <ActionButton onClick={() => setState("edit")} className="hover:bg-blue-100">
          <Pencil size={14} />
        </ActionButton>
        <ActionButton onClick={() => setState("delete")} className="hover:bg-red-100">
          <Trash2 size={14} />
        </ActionButton>
      </span>
    </span>
  );
};
