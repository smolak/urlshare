import { Category } from "@urlshare/db/prisma/client";

import { escapeXml } from "./escape-xml";

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  categories: Category["name"][];
}

interface RSSChannel {
  title: string;
  link: string;
  description: string;
  items: RSSItem[];
  categories: Category["name"][];
}

const buildCategoryTags = (categories: Category["name"][]) =>
  categories.length > 0
    ? categories.reduce((acc, category) => `${acc}<category>${escapeXml(category)}</category>`, "")
    : "";

export function generateRssFeed(channel: RSSChannel): string {
  const items = channel.items
    .map(
      (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <description>${escapeXml(item.description)}</description>
      <link>${escapeXml(item.link)}</link>
      <pubDate>${item.pubDate}</pubDate>
      ${buildCategoryTags(item.categories)}
    </item>
  `
    )
    .join("");

  const channelTitle =
    channel.categories.length > 0
      ? `${escapeXml(channel.title)} (${escapeXml(channel.categories.join(", "))})`
      : escapeXml(channel.title);

  return `
    <?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>${channelTitle}</title>
        <link>${escapeXml(channel.link)}</link>
        <description>${escapeXml(channel.description)}</description>
        <pubDate>${channel.items[0].pubDate}</pubDate>
        ${buildCategoryTags(channel.categories)}
        ${items}
      </channel>
    </rss>
  `;
}
