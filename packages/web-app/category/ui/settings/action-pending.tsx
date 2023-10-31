import { Loader2 } from "lucide-react";
import React from "react";

export const ActionPending = () => {
  return (
    <span className="flex h-[32px] w-[32px] items-center justify-center">
      <Loader2 className="animate-spin cursor-progress" size={14} />
    </span>
  );
};
