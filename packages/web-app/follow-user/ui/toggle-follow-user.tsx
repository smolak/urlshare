import { User } from "@urlshare/db/prisma/client";
import { Button } from "@urlshare/ui/design-system/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@urlshare/ui/design-system/ui/tooltip";
import { UserMinus, UserPlus } from "lucide-react";
import { FC, useEffect, useState } from "react";

import { api } from "../../trpc/client";
import { LoadingIndicator } from "../../ui/loading-indicator";

interface ToggleFollowUserProps {
  userId: User["id"];
}

export const ToggleFollowUser: FC<ToggleFollowUserProps> = ({ userId }) => {
  const trpcContext = api.useContext();
  const { data: isFollowingCheck, isSuccess: isDoneChecking } = api.followUser.isFollowingUser.useQuery({ userId });
  const [isFollowing, setIsFollowing] = useState<boolean>();

  useEffect(() => {
    setIsFollowing(isFollowingCheck);
  }, [isDoneChecking, isFollowingCheck]);

  const { mutate: toggle, isLoading: isToggling } = api.followUser.toggleFollowUser.useMutation({
    onSuccess(input) {
      setIsFollowing(input.status === "following");

      return trpcContext.followUser.isFollowingUser.invalidate({ userId: input.userId });
    },
  });

  if (!isDoneChecking) {
    return <LoadingIndicator label="Checking follow status" />;
  }

  if (isFollowing) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button
              className="flex items-center gap-2"
              variant="outline"
              onClick={() => toggle({ userId })}
              disabled={isToggling}
            >
              Following
              {isToggling ? (
                <LoadingIndicator size={14} label="Unfollowing..." />
              ) : (
                <UserMinus size={14} aria-hidden="true" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Unfollow</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button className="flex items-center gap-2" onClick={() => toggle({ userId })} disabled={isToggling}>
      Follow
      {isToggling ? <LoadingIndicator size={14} label="Following..." /> : <UserPlus size={14} aria-hidden="true" />}
    </Button>
  );
};
