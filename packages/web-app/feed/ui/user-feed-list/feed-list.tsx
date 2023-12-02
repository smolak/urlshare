import { User } from "@prisma/client";
import { ToastAction } from "@urlshare/ui/design-system/ui/toast";
import { useToast } from "@urlshare/ui/design-system/ui/use-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FC, useCallback, useState } from "react";

import { FeedVM } from "../../models/feed.vm";
import { DropdownOptions } from "./dropdown-options";
import { EditFeedItemModal, type OnSuccess } from "./edit-feed-item-modal";
import { FeedListItem } from "./feed-list-item";
import { NotLikedIcon, ToggleLikeUrl } from "./toggle-like-url";

export interface FeedListProps {
  feed: ReadonlyArray<FeedVM>;
  viewerId?: User["id"];
}

export const FeedList: FC<FeedListProps> = ({ feed, viewerId }) => {
  const { status } = useSession();

  const [editedItem, setEditedItem] = useState<FeedVM | null>(null);
  const [feedItems, setFeedItems] = useState(feed);

  const onEditSuccess = useCallback<OnSuccess>(
    (categoryNames) => {
      const updatedFeedItems = feedItems.map((feedItem) => {
        if (feedItem.id === editedItem?.id) {
          return {
            ...feedItem,
            url: {
              ...feedItem.url,
              categoryNames,
            },
          };
        }

        return feedItem;
      });

      setFeedItems(updatedFeedItems);
      setEditedItem(null);
    },
    [editedItem, setEditedItem, feedItems, setFeedItems]
  );

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
    <>
      <section>
        <ol className="flex flex-col gap-4">
          {feedItems.map((feedItem) => (
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
                optionsDropdown={
                  viewerId === feedItem.user.id ? <DropdownOptions onEditClick={() => setEditedItem(feedItem)} /> : null
                }
              />
            </li>
          ))}
        </ol>
      </section>
      {editedItem && editedItem.user.id === viewerId ? (
        <EditFeedItemModal
          feedItem={editedItem}
          open={Boolean(editedItem)}
          onOpenChange={() => setEditedItem(null)}
          onSuccess={onEditSuccess}
        />
      ) : null}
    </>
  );
};
