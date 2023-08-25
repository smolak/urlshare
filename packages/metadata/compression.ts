import { Metadata } from "./types";

export interface CompressedMetadata {
  // audio?: string;
  a?: string;
  // author?: string;
  b?: string;
  // copyright?: string;
  c?: string;
  // description?: string;
  d?: string;
  // email?: string;
  e?: string;
  // facebook?: string;
  f?: string;
  // icon?: string;
  g?: string;
  // image?: string;
  h?: string;
  // keywords?: ReadonlyArray<string>;
  i?: ReadonlyArray<string>;
  // language?: string;
  j?: string;
  // modified?: string;
  k?: string;
  // provider?: string;
  l?: string;
  // published?: string;
  m?: string;
  // robots?: ReadonlyArray<string>;
  n?: ReadonlyArray<string>;
  // section?: string;
  o?: string;
  // title?: string;
  p?: string;
  // twitter?: string;
  q?: string;
  // type?: string;
  r?: string;
  // url?: string;
  s?: string;
  // video?: string;
  t?: string;
  // contentType?: string;
  u?: string;
}

export const compressMapper: Record<keyof Metadata, keyof CompressedMetadata> = {
  audio: "a",
  author: "b",
  copyright: "c",
  description: "d",
  email: "e",
  facebook: "f",
  icon: "g",
  image: "h",
  keywords: "i",
  language: "j",
  modified: "k",
  provider: "l",
  published: "m",
  robots: "n",
  section: "o",
  title: "p",
  twitter: "q",
  type: "r",
  url: "s",
  video: "t",
  contentType: "u",
};

const decompressMapper = Object.entries(compressMapper).reduce(
  (acc, [key, val]) => {
    return { ...acc, [val]: key };
  },
  {} as Record<keyof CompressedMetadata, keyof Metadata>
);

export const compressMetadata = (metadata: Metadata) => {
  return Object.entries(metadata).reduce((acc, [key, val]) => {
    if (val === undefined) {
      return acc;
    }

    const newKey = compressMapper[key as keyof Metadata];

    return {
      ...acc,
      [newKey]: val,
    };
  }, {} as CompressedMetadata);
};

export const decompressMetadata = (compressedMetadata: CompressedMetadata) => {
  return Object.entries(compressedMetadata).reduce((acc, [key, val]) => {
    const newKey = decompressMapper[key as keyof CompressedMetadata];

    return {
      ...acc,
      [newKey]: val,
    };
  }, {} as Metadata);
};
