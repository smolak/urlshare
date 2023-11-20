import { UserProfileData } from "@prisma/client";
import { RssIcon } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

type RssProps = {
  username: UserProfileData["username"];
};

export const RssLink: FC<RssProps> = ({ username }) => {
  return (
    <Link href={`${username}/rss.xml`} className="-mt-3 p-3">
      <RssIcon size={16} />
    </Link>
  );
};
