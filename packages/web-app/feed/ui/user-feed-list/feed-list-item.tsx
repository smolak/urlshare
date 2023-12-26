import { createCdnImageUrl } from "@urlshare/cdn/utils/create-cdn-image-url";
import { isImage, isWebsite } from "@urlshare/metadata/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@urlshare/ui/design-system/ui/avatar";
import { Button } from "@urlshare/ui/design-system/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@urlshare/ui/design-system/ui/card";
import { Calendar, Image as ImageIcon, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { FC, ReactNode } from "react";

import { WEB_APP_DOMAIN } from "../../../constants";
import { LogoIcon } from "../../../ui/logo";
import { UserImage } from "../../../user/ui/user-image";
import { FeedVM } from "../../models/feed.vm";

type FeedListItemProps = {
  feedItem: FeedVM;
  interactions: ReactNode;
  optionsDropdown?: ReactNode;
};

export const FeedListItem: FC<FeedListItemProps> = ({ feedItem, interactions, optionsDropdown }) => {
  const { url, createdAt, user } = feedItem;
  const isAnImage = isImage(url.metadata);
  const isAWebsite = isWebsite(url.metadata);
  const isSomethingElse = !isAnImage && !isAWebsite;

  let imageUrl;

  if (url.metadata.imageCdn || url.metadata.image) {
    if (url.metadata.imageCdn) {
      imageUrl = createCdnImageUrl(url.metadata.imageCdn);
    } else {
      imageUrl = url.metadata.image;
    }
  }

  return (
    <Card className="overflow-hidden shadow hover:shadow-lg">
      <CardHeader className="relative cursor-pointer">
        <CardTitle className="flex items-center gap-3">
          {isAnImage && <ImageIcon strokeWidth={1} size={40} className="text-slate-400" aria-label="Image icon" />}
          {isAWebsite && (
            <Avatar className="h-9 w-9">
              <AvatarImage src={url.metadata.icon} />
              <AvatarFallback />
            </Avatar>
          )}
          {isSomethingElse && (
            <LogoIcon strokeWidth={1} size={40} className="text-slate-400" aria-label={`${WEB_APP_DOMAIN} logo icon`} />
          )}
          <a
            href={url.url}
            title={url.metadata.title}
            target="_blank"
            className="overflow-hidden text-ellipsis leading-7 leading-snug decoration-slate-200 group-hover:underline"
          >
            {url.metadata.title || url.url}
          </a>
        </CardTitle>
        <span className="text-secondary flex flex-row items-center gap-1 pl-12 text-xs text-slate-400">
          <Calendar size={13} />
          <span>{createdAt.toLocaleString()}</span>
        </span>
        {optionsDropdown ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1 h-7 w-7 rounded rounded-full text-slate-400 hover:text-slate-600"
            >
              <MoreHorizontal size={16} />
            </Button>
            {optionsDropdown}
          </>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {imageUrl && (
          <figure>
            <a
              href={url.url}
              title={url.metadata.title}
              target="_blank"
              className="flex max-h-80 place-content-center overflow-hidden rounded rounded-md"
            >
              <img src={imageUrl} alt={url.metadata.title} className="object-cover" />
            </a>
          </figure>
        )}
        <CardDescription>{url.metadata.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-4">
        <div className="flex grow items-center gap-2">
          <div>{interactions}</div>
          <span className="text-xs font-light text-slate-400">{url.categoryNames.join(", ")}</span>
        </div>
        <Link href={`/${user.username}`} className="flex-none">
          <UserImage username={user.username} image={user.image as string} size="small" />
        </Link>
      </CardFooter>
    </Card>
  );
};
