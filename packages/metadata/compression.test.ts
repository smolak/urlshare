import { CompressedMetadata, compressMapper, compressMetadata, decompressMetadata } from "./compression";
import { Metadata } from "./types";

describe("compressMetadata", () => {
  it("should shorten the keys in order to save object's space", () => {
    const metadata: Metadata = {
      audio: "audio",
      author: "author",
      contentType: "text/html; charset=utf-8",
      copyright: "copyright",
      description: "description",
      email: "email",
      facebook: "facebook",
      icon: "icon",
      image: "image",
      keywords: ["keywords"],
      language: "language",
      modified: "modified",
      provider: "provider",
      published: "published",
      robots: ["robots"],
      section: "section",
      title: "title",
      twitter: "twitter",
      type: "type",
      url: "url",
      video: "video",
    };

    const compressedMetadata = compressMetadata(metadata);

    expect(compressedMetadata).toEqual({
      a: "audio",
      b: "author",
      c: "copyright",
      d: "description",
      e: "email",
      f: "facebook",
      g: "icon",
      h: "image",
      i: ["keywords"],
      j: "language",
      k: "modified",
      l: "provider",
      m: "published",
      n: ["robots"],
      o: "section",
      p: "title",
      q: "twitter",
      r: "type",
      s: "url",
      t: "video",
      u: "text/html; charset=utf-8",
    });
  });

  describe("when some fields don't have the value", () => {
    it("should omit them", () => {
      const metadata: Metadata = {
        audio: "audio",
        // explicitly undefined, leaving rest not defined even on the object
        author: undefined,
      };

      const compressedMetadata = compressMetadata(metadata);

      expect(compressedMetadata).toEqual({
        a: "audio",
      });
      const keyForAuthor = compressMapper["author"];
      expect(compressedMetadata).not.toHaveProperty(keyForAuthor);
    });
  });
});

describe("decompress", () => {
  it("should bring back the original keys", () => {
    const compressedMetadata: CompressedMetadata = {
      a: "audio",
      b: "author",
      c: "copyright",
      d: "description",
      e: "email",
      f: "facebook",
      g: "icon",
      h: "image",
      i: ["keywords"],
      j: "language",
      k: "modified",
      l: "provider",
      m: "published",
      n: ["robots"],
      o: "section",
      p: "title",
      q: "twitter",
      r: "type",
      s: "url",
      t: "video",
      u: "text/html; charset=utf-8",
    };

    const metadata = decompressMetadata(compressedMetadata);

    expect(metadata).toEqual({
      audio: "audio",
      author: "author",
      contentType: "text/html; charset=utf-8",
      copyright: "copyright",
      description: "description",
      email: "email",
      facebook: "facebook",
      icon: "icon",
      image: "image",
      keywords: ["keywords"],
      language: "language",
      modified: "modified",
      provider: "provider",
      published: "published",
      robots: ["robots"],
      section: "section",
      title: "title",
      twitter: "twitter",
      type: "type",
      url: "url",
      video: "video",
    });
  });

  describe("when some keys are missing (e.g. had no value, thus been removed in compression)", () => {
    it("should not include them", () => {
      const compressedMetadata: CompressedMetadata = {
        a: "audio",
      };

      const metadata = decompressMetadata(compressedMetadata);

      expect(metadata).toEqual({
        audio: "audio",
      });
    });
  });
});
