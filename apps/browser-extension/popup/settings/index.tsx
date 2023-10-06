import { X } from "lucide-react";
import React, { type FC } from "react";

import { type OnFormSubmit, SettingsForm, type SettingsFormValues } from "./settings-form";

type SettingsProps = {
  values: SettingsFormValues;
  onClose: () => void;
  onSubmit: OnFormSubmit;
};

export const Settings: FC<SettingsProps> = ({ onClose, onSubmit, values }) => {
  return (
    <>
      <div className="absolute right-2">
        <X className="cursor-pointer text-gray-500 hover:text-gray-700" strokeWidth={1} onClick={onClose} size={16} />
      </div>
      <SettingsForm values={values} onSubmit={onSubmit} />
    </>
  );
};
