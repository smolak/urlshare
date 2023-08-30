import { cn } from "@urlshare/ui/utils";
import NextLink, { LinkProps } from "next/link";
import { AnchorHTMLAttributes, FC } from "react";

export const A: FC<LinkProps & AnchorHTMLAttributes<HTMLAnchorElement>> = ({ children, className, ...rest }) => {
  return (
    <NextLink {...rest} className={cn(className, "font-medium text-blue-600 hover:underline")}>
      {children}
    </NextLink>
  );
};
