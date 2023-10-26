import { Tabs, TabsList, TabsTrigger } from "@urlshare/ui/design-system/ui/tabs";
import { cn } from "@urlshare/ui/utils";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { FC, useCallback } from "react";

import { feedSources, feedSourceSchema, FeedSourceValue } from "./feed-source";

type UserFeedSourceSelectorProps = {
  className?: string;
  author: string;
};

export const UserFeedSourceSelector: FC<UserFeedSourceSelectorProps> = ({ author, className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const source = feedSourceSchema.parse(searchParams.get("source"));

  const createSearchParamsString = useCallback(
    (source: FeedSourceValue) => {
      const params = new URLSearchParams(searchParams);

      if (source === "default") {
        params.delete("source");
      } else {
        params.set("source", source);
      }

      return params.toString();
    },
    [searchParams]
  );

  const changeSource = async (source: FeedSourceValue) => {
    const searchParamsString = createSearchParamsString(source);
    let path = pathname;

    if (searchParamsString != "") {
      path += "?" + searchParamsString;
    }

    await router.push(path);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-gray-500">Added by:</span>
      <Tabs
        defaultValue={source}
        onValueChange={(source) => {
          changeSource(source as FeedSourceValue);
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          {feedSources.map(({ label, value }) => {
            let displayLabel: string = label;

            if (value === "author") {
              displayLabel = author;
            }

            return (
              <TabsTrigger value={value} key={value}>
                {displayLabel}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
};
