import { FC } from "react";

import { LoadingIndicator } from "../../ui/loading-indicator";

export const LoadingFeed: FC = () => {
  return (
    <div className="flex justify-center p-20">
      <LoadingIndicator label="Loading feed..." />
    </div>
  );
};
