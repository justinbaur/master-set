import { expect } from "chai";
import { createCollectionSchema, updateCollectionSchema } from "@/lib/schemas/collection-schema";

describe("collection schemas", () => {
  describe("createCollectionSchema", () => {
    it("accepts a valid name only", () => {
      expect(createCollectionSchema.safeParse({ name: "Base Set" }).success).to.be.true;
    });

    it("accepts name with description", () => {
      const result = createCollectionSchema.safeParse({
        name: "Jungle",
        description: "Second expansion set",
      });
      expect(result.success).to.be.true;
      if (result.success) expect(result.data.description).to.equal("Second expansion set");
    });

    it("rejects empty name", () => {
      expect(createCollectionSchema.safeParse({ name: "" }).success).to.be.false;
    });

    it("rejects name over 80 characters", () => {
      expect(createCollectionSchema.safeParse({ name: "x".repeat(81) }).success).to.be.false;
    });

    it("rejects description over 300 characters", () => {
      expect(createCollectionSchema.safeParse({ name: "Set", description: "x".repeat(301) }).success).to.be.false;
    });

    it("accepts omitted description", () => {
      const result = createCollectionSchema.safeParse({ name: "Fossil" });
      expect(result.success).to.be.true;
      if (result.success) expect(result.data.description).to.be.undefined;
    });
  });

  describe("updateCollectionSchema", () => {
    it("accepts only an id", () => {
      expect(updateCollectionSchema.safeParse({ id: "col-1" }).success).to.be.true;
    });

    it("requires a non-empty id", () => {
      expect(updateCollectionSchema.safeParse({ id: "" }).success).to.be.false;
    });

    it("accepts partial name update", () => {
      const result = updateCollectionSchema.safeParse({ id: "col-1", name: "New Name" });
      expect(result.success).to.be.true;
      if (result.success) expect(result.data.name).to.equal("New Name");
    });

    it("accepts partial description update", () => {
      const result = updateCollectionSchema.safeParse({ id: "col-1", description: "Updated desc" });
      expect(result.success).to.be.true;
    });

    it("rejects name over 80 characters", () => {
      expect(updateCollectionSchema.safeParse({ id: "col-1", name: "x".repeat(81) }).success).to.be.false;
    });

    it("rejects description over 300 characters", () => {
      expect(updateCollectionSchema.safeParse({ id: "col-1", description: "x".repeat(301) }).success).to.be.false;
    });
  });
});
