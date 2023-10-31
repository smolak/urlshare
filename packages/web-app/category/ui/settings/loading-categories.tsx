import { LoadingIndicator } from "@urlshare/ui/design-system/ui/loading-indicator";
import { FC } from "react";

export const LoadingCategories: FC = () => {
  return (
    <div className="flex justify-center p-20">
      <LoadingIndicator label="Loading your categories..." />
    </div>
  );
};
