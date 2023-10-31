import { Pencil, Trash2 } from "lucide-react";
import { FC, useState } from "react";

import { CategoryVM } from "../../types/category.vm";
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
        <button
          onClick={() => setState("edit")}
          className="flex h-[32px] w-[32px] items-center justify-center rounded rounded-md hover:bg-blue-100"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => setState("delete")}
          className="flex h-[32px] w-[32px] items-center justify-center rounded rounded-md hover:bg-red-100"
        >
          <Trash2 size={14} />
        </button>
      </span>
    </span>
  );
};
