import nock from "nock";

import { Metadata } from "../../types";
import { htmlContentOfMyProfileOnLN } from "./fixtures/html-content-of-my-profile-on-ln";
import { defaultMetadataFetchAdapter } from "./index";

const baseUrl = "https://urlshare.app";
const path = "/whatever";
const url = baseUrl + path;

describe("defaultMetadataFetchAdapter", () => {
  describe("when the url points to a website", () => {
    beforeEach(() => {
      nock(baseUrl).head(path).reply(200, undefined, {
        "content-type": "text/html",
      });
      nock(baseUrl).get(path).reply(200, htmlContentOfMyProfileOnLN);
    });

    it("should respond with metadata for a website, containing all properties", async () => {
      const metadata = await defaultMetadataFetchAdapter(url);

      const hasMetaPropertiesOfAWebsite = (metadata: Partial<Metadata>) => {
        const expectedProperties = [
          "title",
          "description",
          "language",
          "type",
          "url",
          "provider",
          "keywords",
          "section",
          "author",
          "published",
          "modified",
          "robots",
          "copyright",
          "email",
          "twitter",
          "facebook",
          "image",
          "icon",
          "video",
          "audio",
          "contentType",
        ];

        const metadataProperties = Object.keys(metadata);
        const isPresent = (property: string) => metadataProperties.includes(property);

        return expectedProperties.every(isPresent);
      };
      expect(metadata).toSatisfy(hasMetaPropertiesOfAWebsite);
    });
  });

  describe("when the url doesn't point to a website", () => {
    beforeEach(() => {
      nock(baseUrl).head(path).reply(200, undefined, {
        "content-type": "image/jpg",
      });
    });

    it("should respond with metadata including only detected content-type", async () => {
      const metadata = await defaultMetadataFetchAdapter(url);

      expect(metadata).toEqual({
        contentType: "image/jpg",
      });
    });
  });

  describe("when content type is not in the headers (as it is not guaranteed to be there)", () => {
    beforeEach(() => {
      nock(baseUrl).head(path).reply(200);
    });

    it("should use an empty string", async () => {
      const metadata = await defaultMetadataFetchAdapter(url);

      expect(metadata).toEqual({
        contentType: "",
      });
    });
  });
});
