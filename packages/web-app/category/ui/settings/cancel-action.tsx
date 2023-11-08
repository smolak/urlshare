import { Ban } from "lucide-react";
import React, { FC } from "react";

type CancelActionProps = {
  actionPending: boolean;
  onCancelAction: () => void;
};

export const CancelAction: FC<CancelActionProps> = ({ actionPending, onCancelAction }) => {
  return (
    <button
      type="button"
      onClick={onCancelAction}
      disabled={actionPending}
      className="border-1 group flex h-[31px] w-[31px] items-center justify-center rounded rounded-md hover:bg-gray-100"
    >
      <Ban size={14} />
    </button>
  );
};
