import { Badge } from "@urlshare/ui/design-system/ui/badge";
import { cn } from "@urlshare/ui/utils";
import { FC } from "react";

type FollowingBadgeProps = {
  className?: string;
};

export const FollowingBadge: FC<FollowingBadgeProps> = ({ className }) => (
  <Badge className={cn("py-0 font-normal", className)} variant="secondary">
    Following
  </Badge>
);
