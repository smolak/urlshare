import { generateId } from "./generate-id";

describe("generateId", () => {
  describe("size", () => {
    it("should generate the default size, if not specified", () => {
      const id = generateId();

      expect(id).toHaveLength(21);
    });

    it("should generate a specific size, if passed", () => {
      const id = generateId("", 66);

      expect(id).toHaveLength(66);
    });
  });
});
