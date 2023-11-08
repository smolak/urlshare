import { LoadingIndicator } from "@urlshare/ui/design-system/ui/loading-indicator";
import { cn } from "@urlshare/ui/utils";
import { FC } from "react";

type Size = "default" | "small";
type Variant = "default" | "light";

type LoadingCategoriesProps = {
  className?: string;
  size?: Size;
  variant?: Variant;
};

export const LoadingCategories: FC<LoadingCategoriesProps> = ({ className, size, variant }) => {
  return (
    <div className={cn("flex justify-center", className)}>
      <LoadingIndicator
        label="Loading your categories..."
        className={cn({ "h-4 w-4": size === "small", "text-slate-400": variant === "light" })}
      />
    </div>
  );
};
