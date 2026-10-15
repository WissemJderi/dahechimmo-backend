import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import propertiesService from "../services/propertiesService";
import Property from "../models/property";
import { Location, PropertyType } from "../types";

let mongod: MongoMemoryServer;

const makeProperty = (overrides: Record<string, unknown> = {}) => ({
  title: "Villa au bord de mer",
  ref: "REF-1",
  description: "Belle villa avec piscine",
  price: 450000,
  propertyType: PropertyType.Villa,
  location: Location.Sousse,
  area: 200,
  status: "sale" as const,
  images: ["https://res.cloudinary.com/dummy/image/upload/properties/a.jpg"],
  ...overrides,
});

const refOf = (property: unknown) => (property as { ref: string }).ref;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Property.init();
});

afterEach(async () => {
  await Property.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("propertiesService", () => {
  it("adds and retrieves a property", async () => {
    const saved = await propertiesService.addProperty(makeProperty());

    expect(refOf(saved)).toBe("REF-1");
    expect((saved as { _id: unknown })._id).toBeTruthy();
  });

  it("returns lean plain objects (no mongoose methods)", async () => {
    const saved = await propertiesService.addProperty(makeProperty());
    const found = await propertiesService.getProperty(
      (saved as { _id: string })._id.toString(),
    );

    expect(found).not.toBeNull();
    expect("save" in (found as Record<string, unknown>)).toBe(false);
  });

  it("paginates results newest first", async () => {
    for (let i = 1; i <= 5; i += 1) {
      await propertiesService.addProperty(makeProperty({ ref: `REF-${i}` }));
    }

    const firstPage = await propertiesService.getProperties({
      page: 1,
      limit: 2,
    });

    expect(firstPage.total).toBe(5);
    expect(firstPage.properties).toHaveLength(2);
    expect(refOf(firstPage.properties[0])).toBe("REF-5");
    expect(refOf(firstPage.properties[1])).toBe("REF-4");
  });

  it("skips the right amount for later pages", async () => {
    for (let i = 1; i <= 5; i += 1) {
      await propertiesService.addProperty(makeProperty({ ref: `REF-${i}` }));
    }

    const secondPage = await propertiesService.getProperties({
      page: 2,
      limit: 2,
    });

    expect(secondPage.properties).toHaveLength(2);
    expect(refOf(secondPage.properties[0])).toBe("REF-3");
  });

  it("counts only matching results but skips for pages correctly across a filter", async () => {
    await propertiesService.addProperty(
      makeProperty({ ref: "APP-1", propertyType: PropertyType.Appartement }),
    );
    await propertiesService.addProperty(
      makeProperty({ ref: "APP-2", propertyType: PropertyType.Appartement }),
    );
    await propertiesService.addProperty(
      makeProperty({ ref: "VIL-1", propertyType: PropertyType.Villa }),
    );

    const result = await propertiesService.searchProperties(
      { location: "none", type: PropertyType.Appartement },
      { page: 1, limit: 1 },
    );

    expect(result.total).toBe(2);
    expect(result.properties).toHaveLength(1);
    expect(refOf(result.properties[0])).toBe("APP-2");
  });

  it("updates a property", async () => {
    const saved = await propertiesService.addProperty(makeProperty());

    const updated = await propertiesService.updateProperty(
      (saved as { _id: string })._id.toString(),
      { price: 510000 },
    );

    expect((updated as { price: number }).price).toBe(510000);
  });

  it("deletes a property", async () => {
    const saved = await propertiesService.addProperty(makeProperty());
    const id = (saved as { _id: string })._id.toString();

    await propertiesService.deleteProperty(id);

    expect(await propertiesService.getProperty(id)).toBeNull();
  });

  it("rejects a duplicate ref", async () => {
    await propertiesService.addProperty(makeProperty());

    await expect(propertiesService.addProperty(makeProperty())).rejects.toThrow();
  });

  it("returns all properties sorted newest first", async () => {
    for (let i = 1; i <= 3; i += 1) {
      await propertiesService.addProperty(makeProperty({ ref: `REF-${i}` }));
    }

    const all = await propertiesService.getAllProperties();

    expect(all).toHaveLength(3);
    expect(refOf(all[0])).toBe("REF-3");
  });
});
