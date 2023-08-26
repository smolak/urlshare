import { ToastAction } from "@urlshare/ui/design-system/ui/toast";
import { useToast } from "@urlshare/ui/design-system/ui/use-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FC } from "react";

import { FeedVM } from "../../models/feed.vm";
import { FeedListItem } from "./feed-list-item";
import { NotLikedIcon, ToggleLikeUrl } from "./toggle-like-url";

export interface FeedListProps {
  feed: ReadonlyArray<FeedVM>;
}

export const FeedList: FC<FeedListProps> = ({ feed }) => {
  const { status } = useSession();
  const canLikeUrl = status === "authenticated";
  const { toast } = useToast();
  const showCantLikeWithoutLoginMessage = () => {
    toast({
      title: "Want to like this URL?",
      description: "💡 You need to be logged in first.",
      action: (
        <Link href="/auth/login">
          <ToastAction altText="Login">Login</ToastAction>
        </Link>
      ),
    });
  };

  return (
    <section>
      <ol className="flex flex-col gap-4">
        {feed.map((feedItem) => (
          <li key={feedItem.id}>
            <FeedListItem
              feedItem={feedItem}
              interactions={
                <>
                  {canLikeUrl ? (
                    <ToggleLikeUrl feedId={feedItem.id} liked={feedItem.url.liked} likes={feedItem.url.likes} />
                  ) : (
                    <button
                      className="flex items-center gap-1.5 rounded-xl p-2 text-sm hover:bg-red-50"
                      onClick={showCantLikeWithoutLoginMessage}
                    >
                      <NotLikedIcon />
                      {feedItem.url.likes}
                    </button>
                  )}
                </>
              }
            />
          </li>
        ))}
      </ol>
    </section>
  );
};
