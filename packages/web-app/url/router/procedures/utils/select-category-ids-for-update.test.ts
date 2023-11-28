import { selectCategoryIdsForUpdate } from "./select-category-ids-for-update";

describe("select-category-ids-for-update", () => {
  describe("when none of the new category IDs exist on the list of current Url category IDs", () => {
    const currentCategoryIds = ["a", "b", "c"];
    const newCategoryIds = ["d", "e", "f"];

    it("should select all new Url category IDs as those whose number of Urls is to be incremented", () => {
      const result = selectCategoryIdsForUpdate({ currentCategoryIds, newCategoryIds });

      expect(result.increment).toEqual(newCategoryIds);
    });

    it("should select all current category IDs as those whose number of Urls is to be decremented", () => {
      const result = selectCategoryIdsForUpdate({ currentCategoryIds, newCategoryIds });

      expect(result.decrement).toEqual(currentCategoryIds);
    });
  });

  describe("when some of the new category IDs exist on the list of current Url category IDs", () => {
    const currentCategoryIds = ["a", "b", "c"];
    const newCategoryIds = ["c", "d", "e"];

    it("should select only those new category IDs for increment that are not on the current list", () => {
      const result = selectCategoryIdsForUpdate({ currentCategoryIds, newCategoryIds });

      expect(result.increment).toEqual(["d", "e"]);
    });

    it("should select only those current category IDs for decrement that are not on the new list", () => {
      const result = selectCategoryIdsForUpdate({ currentCategoryIds, newCategoryIds });

      expect(result.decrement).toEqual(["a", "b"]);
    });
  });

  describe("when all of the new category IDs exist on the list of current Url category IDs", () => {
    const currentCategoryIds = ["a", "b", "c"];
    const newCategoryIds = ["a", "b", "c"];

    it("should not select any category ID for increment (nothing changed)", () => {
      const result = selectCategoryIdsForUpdate({ currentCategoryIds, newCategoryIds });

      expect(result.increment).toEqual([]);
    });

    it("should not select any category ID for decrement (nothing changed)", () => {
      const result = selectCategoryIdsForUpdate({ currentCategoryIds, newCategoryIds });

      expect(result.decrement).toEqual([]);
    });
  });
});
