import { expect } from "chai";
import { mkdtemp, rm, mkdir, writeFile, readFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { FilesystemCollectionRepository } from "@/lib/repositories/filesystem-collection-repository";

function makeCollectionJson(overrides: Record<string, unknown> = {}) {
  const now = new Date("2024-03-01T12:00:00.000Z").toISOString();
  return {
    id: "col-1",
    name: "Base Set",
    description: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeCardJson(overrides: Record<string, unknown> = {}) {
  const now = new Date("2024-03-01T12:00:00.000Z").toISOString();
  return {
    id: "card-1",
    collectionId: "col-1",
    name: "Bulbasaur",
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

async function seedCollections(dataDir: string, collections: unknown[]): Promise<void> {
  const dir = join(dataDir, "collections");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "collections.json"), JSON.stringify(collections), "utf-8");
}

async function seedCards(dataDir: string, cards: unknown[]): Promise<void> {
  const dir = join(dataDir, "cards");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "cards.json"), JSON.stringify(cards), "utf-8");
}

describe("FilesystemCollectionRepository", () => {
  let tmpDir: string;
  let repo: FilesystemCollectionRepository;

  beforeEach(async () => {
    tmpDir = await mkdtemp(join(tmpdir(), "master-set-cols-"));
    repo = new FilesystemCollectionRepository(tmpDir);
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  // ── findAll ─────────────────────────────────────────────────────────────────

  describe("findAll", () => {
    it("returns empty array when no data file exists", async () => {
      expect(await repo.findAll()).to.deep.equal([]);
    });

    it("returns collections sorted oldest-first by createdAt", async () => {
      await seedCollections(tmpDir, [
        makeCollectionJson({ id: "newer", createdAt: "2024-06-01T00:00:00.000Z" }),
        makeCollectionJson({ id: "older", createdAt: "2024-01-01T00:00:00.000Z" }),
      ]);
      const cols = await repo.findAll();
      expect(cols[0].id).to.equal("older");
      expect(cols[1].id).to.equal("newer");
    });

    it("deserialises Date fields", async () => {
      await seedCollections(tmpDir, [makeCollectionJson()]);
      const cols = await repo.findAll();
      expect(cols[0].createdAt).to.be.instanceOf(Date);
      expect(cols[0].updatedAt).to.be.instanceOf(Date);
    });
  });

  // ── findById ────────────────────────────────────────────────────────────────

  describe("findById", () => {
    it("returns the matching collection", async () => {
      await seedCollections(tmpDir, [makeCollectionJson({ id: "col-1", name: "Fossil" })]);
      const col = await repo.findById("col-1");
      expect(col).to.not.be.null;
      expect(col!.name).to.equal("Fossil");
    });

    it("returns null for an unknown id", async () => {
      await seedCollections(tmpDir, []);
      expect(await repo.findById("ghost")).to.be.null;
    });
  });

  // ── create ──────────────────────────────────────────────────────────────────

  describe("create", () => {
    beforeEach(async () => {
      await seedCollections(tmpDir, []);
    });

    it("creates a collection with required fields", async () => {
      const col = await repo.create({ name: "Jungle" });
      expect(col.name).to.equal("Jungle");
      expect(col.id).to.be.a("string").with.length.greaterThan(0);
      expect(col.description).to.be.null;
      expect(col.createdAt).to.be.instanceOf(Date);
    });

    it("stores an optional description", async () => {
      const col = await repo.create({ name: "Fossil", description: "Third expansion" });
      expect(col.description).to.equal("Third expansion");
    });

    it("persists to disk so subsequent findAll returns it", async () => {
      await repo.create({ name: "Team Rocket" });
      const all = await repo.findAll();
      expect(all).to.have.length(1);
      expect(all[0].name).to.equal("Team Rocket");
    });

    it("assigns unique ids to each created collection", async () => {
      const a = await repo.create({ name: "Set A" });
      const b = await repo.create({ name: "Set B" });
      expect(a.id).to.not.equal(b.id);
    });
  });

  // ── update ──────────────────────────────────────────────────────────────────

  describe("update", () => {
    beforeEach(async () => {
      await seedCollections(tmpDir, [makeCollectionJson({ id: "col-1", name: "Base Set" })]);
    });

    it("updates the collection name", async () => {
      const updated = await repo.update({ id: "col-1", name: "Base Set 1st Ed." });
      expect(updated.name).to.equal("Base Set 1st Ed.");
    });

    it("updates the description", async () => {
      const updated = await repo.update({ id: "col-1", description: "The original 102-card set" });
      expect(updated.description).to.equal("The original 102-card set");
    });

    it("persists changes so a reload reflects them", async () => {
      await repo.update({ id: "col-1", name: "Renamed" });
      expect((await repo.findById("col-1"))!.name).to.equal("Renamed");
    });

    it("throws for an unknown collection id", async () => {
      try {
        await repo.update({ id: "ghost", name: "X" });
        expect.fail("should have thrown");
      } catch (err) {
        expect((err as Error).message).to.include("not found");
      }
    });
  });

  // ── delete ──────────────────────────────────────────────────────────────────

  describe("delete", () => {
    it("removes the collection", async () => {
      await seedCollections(tmpDir, [
        makeCollectionJson({ id: "col-1" }),
        makeCollectionJson({ id: "col-2", name: "Jungle" }),
      ]);
      await seedCards(tmpDir, []);
      await repo.delete("col-1");
      expect(await repo.findById("col-1")).to.be.null;
      expect(await repo.findById("col-2")).to.not.be.null;
    });

    it("cascades deletion to cards in the collection", async () => {
      await seedCollections(tmpDir, [makeCollectionJson({ id: "col-1" })]);
      await seedCards(tmpDir, [
        makeCardJson({ id: "c1", collectionId: "col-1" }),
        makeCardJson({ id: "c2", collectionId: "col-2" }),
      ]);

      await repo.delete("col-1");

      const raw = JSON.parse(await readFile(join(tmpDir, "cards", "cards.json"), "utf-8")) as { id: string }[];
      expect(raw).to.have.length(1);
      expect(raw[0].id).to.equal("c2");
    });

    it("leaves cards from other collections intact after cascade", async () => {
      await seedCollections(tmpDir, [makeCollectionJson({ id: "col-1" })]);
      await seedCards(tmpDir, [
        makeCardJson({ id: "keep-1", collectionId: "col-2" }),
        makeCardJson({ id: "keep-2", collectionId: "col-2" }),
        makeCardJson({ id: "gone", collectionId: "col-1" }),
      ]);

      await repo.delete("col-1");

      const raw = JSON.parse(await readFile(join(tmpDir, "cards", "cards.json"), "utf-8")) as { id: string }[];
      expect(raw.map((c) => c.id)).to.include.members(["keep-1", "keep-2"]);
      expect(raw.map((c) => c.id)).to.not.include("gone");
    });

    it("throws for an unknown collection id", async () => {
      await seedCollections(tmpDir, []);
      try {
        await repo.delete("ghost");
        expect.fail("should have thrown");
      } catch (err) {
        expect((err as Error).message).to.include("not found");
      }
    });
  });
});
