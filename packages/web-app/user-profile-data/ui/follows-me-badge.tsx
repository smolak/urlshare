import { Badge } from "@urlshare/ui/design-system/ui/badge";
import { cn } from "@urlshare/ui/utils";
import { FC } from "react";

type FollowsMeBadgeProps = {
  className?: string;
};

export const FollowsMeBadge: FC<FollowsMeBadgeProps> = ({ className }) => (
  <Badge className={cn("py-0 font-normal", className)} variant="secondary">
    Follows me
  </Badge>
);
