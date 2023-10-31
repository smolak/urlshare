import React, { FC, PropsWithChildren } from "react";

export const StickyErrorMessage: FC<PropsWithChildren> = ({ children }) => {
  return (
    <p className="absolute rounded rounded-md rounded-t-none bg-red-50 px-2 py-1 text-sm text-red-600">{children}</p>
  );
};
