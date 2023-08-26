import { Card, CardContent, CardHeader, CardTitle } from "@urlshare/ui/design-system/ui/card";
import { cn } from "@urlshare/ui/utils";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";

import { ToggleFollowUser } from "../../../follow-user/ui/toggle-follow-user";
import { UserImage } from "../../../user/ui/user-image";
import { PublicUserProfileDataVM } from "../../models/public-user-profile-data.vm";
import { DataElement } from "./data-element";

interface UserProfileCardProps {
  publicUserProfileData: PublicUserProfileDataVM;
  canFollow?: boolean;
}

export const UserProfileCard: FC<UserProfileCardProps> = ({ publicUserProfileData, canFollow = false }) => {
  const { pathname } = useRouter();
  const { id, username, image, following, followers, likes, urlsCount } = publicUserProfileData;

  return (
    <Card className="grid grid-cols-2 py-1.5 md:sticky md:top-[138px] md:block lg:top-36">
      <CardHeader className="md:b-2 p-2">
        <CardTitle className="flex flex-col items-center gap-2 md:pt-7">
          <UserImage username={username} image={image} size="big" className="hover:ring-0 md:absolute md:-top-9" />
          <div className="flex flex-col items-center gap-2">
            <span className="text-lg">@{username}</span>
            {canFollow && <ToggleFollowUser userId={id} />}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-stretch p-2 md:flex-col">
        <div className="md:text-md max-md:flex max-md:flex-col max-md:justify-between md:grid md:grid-cols-2 md:grid-rows-2 md:gap-x-14 md:gap-y-4 md:text-center">
          <Link
            href={`/${username}`}
            className={cn("rounded-md px-2 py-1", pathname === "/[username]" && "bg-slate-100")}
          >
            <DataElement name="URLs" value={urlsCount} />
          </Link>
          <div className={cn("rounded-md px-2 py-1", pathname === "/[username]/likes" && "bg-slate-100")}>
            <DataElement name="Likes" value={likes} />
          </div>
          <Link
            href={`/${username}/following`}
            className={cn("rounded-md px-2 py-1", pathname === "/[username]/following" && "bg-slate-100")}
          >
            <DataElement name="Following" value={following} />
          </Link>
          <Link
            href={`/${username}/followers`}
            className={cn("rounded-md px-2 py-1", pathname === "/[username]/followers" && "bg-slate-100")}
          >
            <DataElement name="Followers" value={followers} />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
