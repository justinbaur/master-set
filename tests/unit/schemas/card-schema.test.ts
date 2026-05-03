import { expect } from "chai";
import {
  createCardSchema,
  updateCardSchema,
  markPurchasedSchema,
  addImageSchema,
  deleteCardSchema,
} from "@/lib/schemas/card-schema";

function makeFile(sizeBytes = 100, type = "image/png", name = "test.png"): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

describe("card schemas", () => {
  describe("createCardSchema", () => {
    const base = () => ({
      collectionId: "col-1",
      name: "Charizard Base Set 4/102",
      image: makeFile(),
    });

    it("accepts a minimal valid card", () => {
      expect(createCardSchema.safeParse(base()).success).to.be.true;
    });

    it("accepts all optional fields", () => {
      const result = createCardSchema.safeParse({
        ...base(),
        purchaseLink: "https://ebay.com/itm/123",
        maxPrice: "49.99",
        notes: "Near mint condition",
      });
      expect(result.success).to.be.true;
      if (result.success) {
        expect(result.data.maxPrice).to.equal(49.99);
        expect(result.data.notes).to.equal("Near mint condition");
      }
    });

    it("rejects missing collectionId", () => {
      expect(createCardSchema.safeParse({ ...base(), collectionId: "" }).success).to.be.false;
    });

    it("rejects missing name", () => {
      expect(createCardSchema.safeParse({ ...base(), name: "" }).success).to.be.false;
    });

    it("rejects name over 200 characters", () => {
      expect(createCardSchema.safeParse({ ...base(), name: "x".repeat(201) }).success).to.be.false;
    });

    it("rejects image over 10 MB", () => {
      const big = makeFile(11 * 1024 * 1024);
      expect(createCardSchema.safeParse({ ...base(), image: big }).success).to.be.false;
    });

    it("rejects unsupported image type", () => {
      expect(createCardSchema.safeParse({ ...base(), image: makeFile(100, "image/gif") }).success).to.be.false;
    });

    it("accepts jpeg image type", () => {
      expect(createCardSchema.safeParse({ ...base(), image: makeFile(100, "image/jpeg") }).success).to.be.true;
    });

    it("accepts webp image type", () => {
      expect(createCardSchema.safeParse({ ...base(), image: makeFile(100, "image/webp") }).success).to.be.true;
    });

    it("accepts a valid purchaseLink URL", () => {
      expect(createCardSchema.safeParse({ ...base(), purchaseLink: "https://tcgplayer.com/listing/1" }).success).to.be.true;
    });

    it("accepts empty string purchaseLink", () => {
      expect(createCardSchema.safeParse({ ...base(), purchaseLink: "" }).success).to.be.true;
    });

    it("rejects invalid purchaseLink", () => {
      expect(createCardSchema.safeParse({ ...base(), purchaseLink: "not-a-url" }).success).to.be.false;
    });

    it("coerces maxPrice string to number", () => {
      const result = createCardSchema.safeParse({ ...base(), maxPrice: "25.99" });
      expect(result.success).to.be.true;
      if (result.success) expect(result.data.maxPrice).to.equal(25.99);
    });

    it("treats empty string maxPrice as undefined", () => {
      const result = createCardSchema.safeParse({ ...base(), maxPrice: "" });
      expect(result.success).to.be.true;
      if (result.success) expect(result.data.maxPrice).to.be.undefined;
    });

    it("rejects negative maxPrice", () => {
      expect(createCardSchema.safeParse({ ...base(), maxPrice: "-10" }).success).to.be.false;
    });

    it("rejects zero maxPrice", () => {
      expect(createCardSchema.safeParse({ ...base(), maxPrice: "0" }).success).to.be.false;
    });

    it("rejects notes over 1000 characters", () => {
      expect(createCardSchema.safeParse({ ...base(), notes: "x".repeat(1001) }).success).to.be.false;
    });
  });

  describe("updateCardSchema", () => {
    it("accepts only an id (no-op update)", () => {
      expect(updateCardSchema.safeParse({ id: "card-1" }).success).to.be.true;
    });

    it("requires a non-empty id", () => {
      expect(updateCardSchema.safeParse({ id: "" }).success).to.be.false;
    });

    it("accepts partial field updates", () => {
      const result = updateCardSchema.safeParse({
        id: "card-1",
        name: "Updated Name",
        purchaseLink: "https://ebay.com",
        notes: "New notes",
      });
      expect(result.success).to.be.true;
    });

    it("coerces maxPrice to number", () => {
      const result = updateCardSchema.safeParse({ id: "card-1", maxPrice: "100" });
      expect(result.success).to.be.true;
      if (result.success) expect(result.data.maxPrice).to.equal(100);
    });

    it("treats empty maxPrice as undefined (clear the field)", () => {
      const result = updateCardSchema.safeParse({ id: "card-1", maxPrice: "" });
      expect(result.success).to.be.true;
      if (result.success) expect(result.data.maxPrice).to.be.undefined;
    });

    it("rejects name longer than 200 chars", () => {
      expect(updateCardSchema.safeParse({ id: "card-1", name: "x".repeat(201) }).success).to.be.false;
    });
  });

  describe("markPurchasedSchema", () => {
    it("accepts marking as purchased", () => {
      expect(markPurchasedSchema.safeParse({ id: "card-1", isPurchased: true }).success).to.be.true;
    });

    it("accepts marking as wanted", () => {
      expect(markPurchasedSchema.safeParse({ id: "card-1", isPurchased: false }).success).to.be.true;
    });

    it("requires a non-empty id", () => {
      expect(markPurchasedSchema.safeParse({ id: "", isPurchased: true }).success).to.be.false;
    });
  });

  describe("addImageSchema", () => {
    const base = () => ({ cardId: "card-1", image: makeFile() });

    it("accepts valid input without caption", () => {
      expect(addImageSchema.safeParse(base()).success).to.be.true;
    });

    it("accepts input with caption", () => {
      expect(addImageSchema.safeParse({ ...base(), caption: "Front of card" }).success).to.be.true;
    });

    it("requires a non-empty cardId", () => {
      expect(addImageSchema.safeParse({ ...base(), cardId: "" }).success).to.be.false;
    });

    it("rejects caption over 200 characters", () => {
      expect(addImageSchema.safeParse({ ...base(), caption: "x".repeat(201) }).success).to.be.false;
    });

    it("rejects oversized image", () => {
      expect(addImageSchema.safeParse({ ...base(), image: makeFile(11 * 1024 * 1024) }).success).to.be.false;
    });
  });

  describe("deleteCardSchema", () => {
    it("accepts a valid id", () => {
      expect(deleteCardSchema.safeParse({ id: "card-1" }).success).to.be.true;
    });

    it("rejects an empty id", () => {
      expect(deleteCardSchema.safeParse({ id: "" }).success).to.be.false;
    });
  });
});
