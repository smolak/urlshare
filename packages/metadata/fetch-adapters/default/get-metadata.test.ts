import _getMetadata from "metadata-scraper";

import { createExampleMetadataScraperResult } from "./fixtures/example-metadata";
import { getMetadata } from "./get-metadata";

vi.mock("metadata-scraper");
const _getMetadataMock = vi.mocked(_getMetadata);

describe("getMetadata", () => {
  it("should use the underlying module to scrape the metadata off the URL provided", async () => {
    const url = "https://urlshare.app";

    await getMetadata(url);

    expect(_getMetadataMock).toHaveBeenCalledWith({
      url,
    });
  });

  describe("when the html is provided", () => {
    it("should be passed to the metadata scraper in options as well", async () => {
      const url = "https://urlshare.app";
      const html = "<html><body>Hello, world!</body></html>";

      await getMetadata(url, html);

      expect(_getMetadataMock).toHaveBeenCalledWith({
        url,
        html,
      });
    });
  });

  it("should return the result of scrapping the metadata", async () => {
    const url = "https://urlshare.app";
    const exampleMetadata = createExampleMetadataScraperResult({ url });

    _getMetadataMock.mockResolvedValue(exampleMetadata);

    const result = await getMetadata(url);

    expect(result).toEqual(exampleMetadata);
  });
});
