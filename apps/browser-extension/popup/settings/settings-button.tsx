import { cn } from "@urlshare/ui/utils";
import { Settings as SettingsIcon } from "lucide-react";
import React, { type FC } from "react";

type SettingsButtonProps = {
  className?: string;
  onClick: () => void;
};

export const SettingsButton: FC<SettingsButtonProps> = ({ className, onClick }) => {
  return (
    <SettingsIcon
      className={cn("cursor-pointer text-gray-500 hover:text-gray-700", className)}
      strokeWidth={1}
      onClick={onClick}
      size={16}
    />
  );
};
