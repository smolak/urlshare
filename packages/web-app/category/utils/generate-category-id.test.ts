import { CATEGORY_ID_PREFIX, generateCategoryId } from "./generate-category-id";

describe("generateCategoryId", () => {
  it("should prefix id with category prefix", () => {
    const id = generateCategoryId();

    const pattern = `^${CATEGORY_ID_PREFIX}`;
    expect(id).toMatch(new RegExp(pattern));
  });
});
