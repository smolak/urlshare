import { Loader2, LucideProps } from "lucide-react";
import React, { FC } from "react";

import { cn } from "../../utils";

interface LoadingIndicatorProps {
  label: string;
  size?: LucideProps["size"];
  className?: string;
}

export const LoadingIndicator: FC<LoadingIndicatorProps> = ({ label, size, className }) => {
  return <Loader2 className={cn("animate-spin cursor-progress", className)} aria-label={label} size={size} />;
};
