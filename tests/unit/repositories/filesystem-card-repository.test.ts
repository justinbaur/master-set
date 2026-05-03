import { expect } from "chai";
import { mkdtemp, rm, mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { FilesystemCardRepository } from "@/lib/repositories/filesystem-card-repository";

function makeCardJson(overrides: Record<string, unknown> = {}) {
  const now = new Date("2024-03-01T12:00:00.000Z").toISOString();
  return {
    id: "card-1",
    collectionId: "col-1",
    name: "Charizard",
    imageUrl: "/api/images/original/card-1.png",
    thumbnailUrl: "/api/images/thumbnails/card-1_thumb.webp",
    purchaseLink: null,
    maxPrice: null,
    isPurchased: false,
    purchasedAt: null,
    uploadedImages: [],
    notes: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

async function seedCards(dataDir: string, cards: unknown[]): Promise<void> {
  const dir = join(dataDir, "cards");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "cards.json"), JSON.stringify(cards), "utf-8");
}

describe("FilesystemCardRepository", () => {
  let tmpDir: string;
  let repo: FilesystemCardRepository;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "master-set-cards-"));
    repo = new FilesystemCardRepository(tmpDir);
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  // ── findAll ─────────────────────────────────────────────────────────────────

  describe("findAll", () => {
    it("returns empty array when no data file exists", async () => {
      expect(await repo.findAll()).to.deep.equal([]);
    });

    it("returns all cards sorted newest-first", async () => {
      await seedCards(tmpDir, [
        makeCardJson({ id: "old", createdAt: "2024-01-01T00:00:00.000Z" }),
        makeCardJson({ id: "new", createdAt: "2024-06-01T00:00:00.000Z" }),
      ]);
      const cards = await repo.findAll();
      expect(cards[0].id).to.equal("new");
      expect(cards[1].id).to.equal("old");
    });

    it("filters by collectionId when provided", async () => {
      await seedCards(tmpDir, [
        makeCardJson({ id: "c1", collectionId: "col-1" }),
        makeCardJson({ id: "c2", collectionId: "col-2" }),
      ]);
      const cards = await repo.findAll("col-1");
      expect(cards).to.have.length(1);
      expect(cards[0].id).to.equal("c1");
    });

    it("returns all cards when no collectionId filter given", async () => {
      await seedCards(tmpDir, [
        makeCardJson({ id: "c1", collectionId: "col-1" }),
        makeCardJson({ id: "c2", collectionId: "col-2" }),
      ]);
      expect(await repo.findAll()).to.have.length(2);
    });
  });

  // ── findById ────────────────────────────────────────────────────────────────

  describe("findById", () => {
    it("returns the matching card", async () => {
      await seedCards(tmpDir, [makeCardJson({ id: "card-1", name: "Blastoise" })]);
      const card = await repo.findById("card-1");
      expect(card).to.not.be.null;
      expect(card!.name).to.equal("Blastoise");
    });

    it("returns null for an unknown id", async () => {
      await seedCards(tmpDir, []);
      expect(await repo.findById("unknown")).to.be.null;
    });

    it("deserialises Date fields correctly", async () => {
      await seedCards(tmpDir, [makeCardJson({ id: "c1" })]);
      const card = await repo.findById("c1");
      expect(card!.createdAt).to.be.instanceOf(Date);
      expect(card!.updatedAt).to.be.instanceOf(Date);
    });
  });

  // ── findByPurchaseStatus ────────────────────────────────────────────────────

  describe("findByPurchaseStatus", () => {
    beforeEach(async () => {
      await seedCards(tmpDir, [
        makeCardJson({ id: "owned-1", collectionId: "col-1", isPurchased: true }),
        makeCardJson({ id: "owned-2", collectionId: "col-2", isPurchased: true }),
        makeCardJson({ id: "wanted-1", collectionId: "col-1", isPurchased: false }),
      ]);
    });

    it("returns only owned cards", async () => {
      const cards = await repo.findByPurchaseStatus(true);
      expect(cards).to.have.length(2);
      expect(cards.every((c) => c.isPurchased)).to.be.true;
    });

    it("returns only wanted cards", async () => {
      const cards = await repo.findByPurchaseStatus(false);
      expect(cards).to.have.length(1);
      expect(cards[0].id).to.equal("wanted-1");
    });

    it("filters owned by collectionId", async () => {
      const cards = await repo.findByPurchaseStatus(true, "col-1");
      expect(cards).to.have.length(1);
      expect(cards[0].id).to.equal("owned-1");
    });

    it("filters wanted by collectionId", async () => {
      const cards = await repo.findByPurchaseStatus(false, "col-1");
      expect(cards).to.have.length(1);
      expect(cards[0].id).to.equal("wanted-1");
    });
  });

  // ── update ──────────────────────────────────────────────────────────────────

  describe("update", () => {
    beforeEach(async () => {
      await seedCards(tmpDir, [makeCardJson({ id: "card-1", name: "Original" })]);
    });

    it("updates the card name", async () => {
      const updated = await repo.update({ id: "card-1", name: "Updated" });
      expect(updated.name).to.equal("Updated");
    });

    it("updates purchaseLink", async () => {
      const updated = await repo.update({ id: "card-1", purchaseLink: "https://ebay.com" });
      expect(updated.purchaseLink).to.equal("https://ebay.com");
    });

    it("updates maxPrice", async () => {
      const updated = await repo.update({ id: "card-1", maxPrice: 49.99 });
      expect(updated.maxPrice).to.equal(49.99);
    });

    it("clears maxPrice when set to null", async () => {
      await seedCards(tmpDir, [makeCardJson({ id: "card-1", maxPrice: 25 })]);
      const updated = await repo.update({ id: "card-1", maxPrice: null });
      expect(updated.maxPrice).to.be.null;
    });

    it("persists changes to disk", async () => {
      await repo.update({ id: "card-1", name: "Persisted" });
      const reloaded = await repo.findById("card-1");
      expect(reloaded!.name).to.equal("Persisted");
    });

    it("bumps updatedAt on change", async () => {
      const before = (await repo.findById("card-1"))!.updatedAt;
      await new Promise((r) => setTimeout(r, 5));
      const updated = await repo.update({ id: "card-1", name: "New" });
      expect(updated.updatedAt.getTime()).to.be.greaterThan(before.getTime());
    });

    it("throws for an unknown card id", async () => {
      try {
        await repo.update({ id: "ghost" });
        expect.fail("should have thrown");
      } catch (err) {
        expect((err as Error).message).to.include("not found");
      }
    });
  });

  // ── markPurchased ───────────────────────────────────────────────────────────

  describe("markPurchased", () => {
    it("marks wanted card as purchased and sets purchasedAt", async () => {
      await seedCards(tmpDir, [makeCardJson({ id: "card-1", isPurchased: false })]);
      const card = await repo.markPurchased({ id: "card-1", isPurchased: true });
      expect(card.isPurchased).to.be.true;
      expect(card.purchasedAt).to.be.instanceOf(Date);
    });

    it("marks purchased card back to wanted and clears purchasedAt", async () => {
      await seedCards(tmpDir, [
        makeCardJson({ id: "card-1", isPurchased: true, purchasedAt: new Date().toISOString() }),
      ]);
      const card = await repo.markPurchased({ id: "card-1", isPurchased: false });
      expect(card.isPurchased).to.be.false;
      expect(card.purchasedAt).to.be.null;
    });
  });

  // ── delete ──────────────────────────────────────────────────────────────────

  describe("delete", () => {
    it("removes the card from storage", async () => {
      await seedCards(tmpDir, [makeCardJson({ id: "card-1" }), makeCardJson({ id: "card-2" })]);
      await repo.delete("card-1");
      expect(await repo.findById("card-1")).to.be.null;
      expect(await repo.findById("card-2")).to.not.be.null;
    });

    it("throws for an unknown id", async () => {
      await seedCards(tmpDir, []);
      try {
        await repo.delete("ghost");
        expect.fail("should have thrown");
      } catch (err) {
        expect((err as Error).message).to.include("not found");
      }
    });
  });

  // ── count ───────────────────────────────────────────────────────────────────

  describe("count", () => {
    it("returns 0 when no cards exist", async () => {
      expect(await repo.count()).to.equal(0);
    });

    it("returns total count across all collections", async () => {
      await seedCards(tmpDir, [
        makeCardJson({ id: "c1", collectionId: "col-1" }),
        makeCardJson({ id: "c2", collectionId: "col-2" }),
      ]);
      expect(await repo.count()).to.equal(2);
    });

    it("returns count filtered by collectionId", async () => {
      await seedCards(tmpDir, [
        makeCardJson({ id: "c1", collectionId: "col-1" }),
        makeCardJson({ id: "c2", collectionId: "col-2" }),
      ]);
      expect(await repo.count("col-1")).to.equal(1);
    });
  });

  // ── exists ───────────────────────────────────────────────────────────────────

  describe("exists", () => {
    it("returns true for a known id", async () => {
      await seedCards(tmpDir, [makeCardJson({ id: "card-1" })]);
      expect(await repo.exists("card-1")).to.be.true;
    });

    it("returns false for an unknown id", async () => {
      await seedCards(tmpDir, []);
      expect(await repo.exists("ghost")).to.be.false;
    });
  });

  // ── maxPrice field ───────────────────────────────────────────────────────────

  describe("maxPrice", () => {
    it("persists a numeric maxPrice", async () => {
      await seedCards(tmpDir, [makeCardJson({ id: "card-1", maxPrice: 75.5 })]);
      expect((await repo.findById("card-1"))!.maxPrice).to.equal(75.5);
    });

    it("persists null maxPrice", async () => {
      await seedCards(tmpDir, [makeCardJson({ id: "card-1", maxPrice: null })]);
      expect((await repo.findById("card-1"))!.maxPrice).to.be.null;
    });
  });
});
