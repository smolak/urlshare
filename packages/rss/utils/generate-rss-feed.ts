import { escapeXml } from "./excape-xml";

interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

interface RSSChannel {
  title: string;
  link: string;
  description: string;
  items: RSSItem[];
}

export function generateRssFeed(channel: RSSChannel): string {
  const items = channel.items
    .map(
      (item) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <description>${escapeXml(item.description)}</description>
      <link>${escapeXml(item.link)}</link>
      <pubDate>${item.pubDate}</pubDate>
    </item>
  `
    )
    .join("");

  return `
    <?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>${escapeXml(channel.title)}</title>
        <link>${escapeXml(channel.link)}</link>
        <description>${escapeXml(channel.description)}</description>
        <pubDate>${channel.items[0].pubDate}</pubDate>
        ${items}
      </channel>
    </rss>
  `;
}
