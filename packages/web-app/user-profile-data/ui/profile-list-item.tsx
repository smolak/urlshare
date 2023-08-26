import { UserProfileData } from "@prisma/client";
import { YesNo } from "@urlshare/shared/types";
import { Card } from "@urlshare/ui/design-system/ui/card";
import { FC } from "react";

import { UserImage } from "../../user/ui/user-image";
import { FollowingBadge } from "./following-badge";
import { FollowsMeBadge } from "./follows-me-badge";

export type ProfileListItemProps = {
  username: UserProfileData["username"];
  image: UserProfileData["image"];
  iFollow?: YesNo;
  isFollowingMe?: YesNo;
};

export const ProfileListItem: FC<ProfileListItemProps> = ({ username, image, isFollowingMe, iFollow }) => {
  return (
    // <Card className="flex items-center gap-4 p-1 hover:bg-slate-50">
    <Card className="flex items-center items-stretch gap-4 p-1 hover:bg-slate-50 md:p-2">
      <UserImage username={username} image={image} className="row-span-2" />
      <div className="flex flex-col justify-around gap-1 md:flex-row md:items-center md:gap-4">
        <span className="font-medium max-md:text-sm">@{username}</span>
        {(isFollowingMe === "yes" || iFollow === "yes") && (
          <div className="flex gap-2">
            {isFollowingMe === "yes" && <FollowsMeBadge />}
            {iFollow === "yes" && <FollowingBadge />}
          </div>
        )}
      </div>
    </Card>
  );
};
