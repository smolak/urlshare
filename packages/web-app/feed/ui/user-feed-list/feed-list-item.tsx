import { isImage, isWebsite } from "@urlshare/metadata/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@urlshare/ui/design-system/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@urlshare/ui/design-system/ui/card";
import { Calendar, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { FC, ReactNode } from "react";

import { LogoIcon } from "../../../ui/logo";
import { UserImage } from "../../../user/ui/user-image";
import { FeedVM } from "../../models/feed.vm";

type FeedListItemProps = {
  feedItem: FeedVM;
  interactions: ReactNode;
};

export const FeedListItem: FC<FeedListItemProps> = ({ feedItem, interactions }) => {
  const { url, createdAt, user } = feedItem;
  const isAnImage = isImage(url.metadata);
  const isAWebsite = isWebsite(url.metadata);
  const isSomethingElse = !isAnImage && !isAWebsite;

  return (
    <Card className="overflow-hidden shadow hover:shadow-lg">
      <CardHeader className="group cursor-pointer gap-2">
        <CardTitle className="flex items-center gap-3">
          {isAnImage && <ImageIcon strokeWidth={1} size={40} className="text-slate-400" aria-label="Image icon" />}
          {isAWebsite && (
            <Avatar className="h-9 w-9">
              <AvatarImage src={url.metadata.icon} />
              <AvatarFallback />
            </Avatar>
          )}
          {isSomethingElse && (
            <LogoIcon strokeWidth={1} size={40} className="text-slate-400" aria-label="Urlshare.me logo icon" />
          )}
          <a
            href={url.url}
            title={url.metadata.title}
            target="_blank"
            className="overflow-hidden text-ellipsis leading-7 decoration-slate-200 group-hover:underline"
          >
            {url.metadata.title || url.url}
          </a>
        </CardTitle>
        <span className="text-secondary flex flex-row items-center gap-2 pl-12 text-xs">
          <Calendar size={13} />
          <span>{createdAt.toLocaleString()}</span>
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {url.metadata.image && (
          <figure>
            <a
              href={url.url}
              title={url.metadata.title}
              target="_blank"
              className="flex max-h-96 place-content-center overflow-hidden"
            >
              <img src={url.metadata.image} alt={url.metadata.title} className="object-cover" />
            </a>
          </figure>
        )}
        <CardDescription>{url.metadata.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>{interactions}</div>
        <Link href={`/${user.username}`}>
          <UserImage username={user.username} image={user.image as string} size="small" />
        </Link>
      </CardFooter>
    </Card>
  );
};
