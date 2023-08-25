import { MetaData } from "metadata-scraper";

import { Metadata } from "../../../types";

export const createExampleWebsiteMetadata = (overwrites: Partial<Metadata> = {}): Metadata => ({
  audio: "Audio info",
  author: "Page Author",
  contentType: "text/html; charset=utf-8",
  copyright: "Copyright info",
  description: "Description",
  email: "email@gmail.com",
  facebook: "facebook.handle",
  icon: "https://icon.url",
  image: "https://image.url",
  keywords: ["keyword1", "keyword2"],
  language: "pl",
  modified: new Date().toISOString(),
  provider: "Provider info",
  published: new Date().toISOString(),
  robots: ["robots"],
  section: "Section info",
  title: "Page title",
  twitter: "https://twitter.com/user",
  type: "Type info",
  url: "https://the.url",
  video: "Video info",
  ...overwrites,
});

export const createExampleImageMetadata = (overwriteContentType = ""): Metadata => ({
  contentType: overwriteContentType || "image/jpg",
});

export const createExampleMetadataScraperResult = (overwrites: Partial<MetaData> = {}): MetaData => ({
  audio: "Audio info",
  author: "Page Author",
  contentType: "text/html; charset=utf-8",
  copyright: "Copyright info",
  description: "Description",
  email: "email@gmail.com",
  facebook: "facebook.handle",
  icon: "https://icon.url",
  image: "https://image.url",
  keywords: ["keyword1", "keyword2"],
  language: "pl",
  modified: new Date().toISOString(),
  provider: "Provider info",
  published: new Date().toISOString(),
  robots: ["robots"],
  section: "Section info",
  title: "Page title",
  twitter: "https://twitter.com/user",
  type: "Type info",
  url: "https://the.url",
  video: "Vide info",
  ...overwrites,
});
