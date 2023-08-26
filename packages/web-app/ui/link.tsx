import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { FC, PropsWithChildren } from "react";

interface LinkProps extends NextLinkProps {}

export const Link: FC<PropsWithChildren<LinkProps>> = ({ children, ...rest }) => {
  return (
    <NextLink {...rest} className="font-medium text-blue-600 hover:underline">
      {children}
    </NextLink>
  );
};
