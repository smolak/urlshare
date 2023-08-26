import { UserProfileData } from "@urlshare/db/prisma/client";
import Link from "next/link";
import { FC } from "react";

import { ProfileListItem, ProfileListItemProps } from "./profile-list-item";

type FollowersListProps = {
  username: UserProfileData["username"];
  profiles: ReadonlyArray<ProfileListItemProps>;
  myProfile?: boolean;
};

export const FollowersList: FC<FollowersListProps> = ({ username, profiles, myProfile }) => {
  return (
    <section className="lg:min-h-[350px]">
      <h1 className="mb-5 text-lg font-bold">
        {myProfile ? "Profiles following me" : `Profiles following ${username}`}
      </h1>
      <ol className="flex flex-col gap-1.5">
        {profiles.map((profile) => {
          return (
            <li key={profile.username}>
              <Link href={`/${profile.username}`}>
                <ProfileListItem {...profile} />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
