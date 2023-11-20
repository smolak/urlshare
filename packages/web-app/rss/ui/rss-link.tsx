import { UserProfileData } from "@prisma/client";
import { RssIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FC } from "react";

type RssProps = {
  username: UserProfileData["username"];
};

const createRssLink = (username: UserProfileData["username"], searchParams: string) => {
  return `${username}/rss.xml` + (searchParams !== "" ? `?${searchParams}` : "");
};

export const RssLink: FC<RssProps> = ({ username }) => {
  const searchParams = useSearchParams().toString().trim();
  const rssLink = createRssLink(username, searchParams);

  return (
    <Link href={rssLink} className="-mt-3 p-3">
      <RssIcon size={16} />
    </Link>
  );
};
