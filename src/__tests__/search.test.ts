import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app from "../app";
import Property from "../models/property";
import propertiesService from "../services/propertiesService";
import { Location, PropertyType } from "../types";

let mongod: MongoMemoryServer;

const baseProperty = {
  title: "Villa with pool",
  ref: "REF-1",
  description: "A nice villa",
  price: 500_000,
  propertyType: PropertyType.Villa,
  location: Location.Sousse,
  area: 200,
  status: "sale" as const,
  images: ["https://res.cloudinary.com/dummy/image/upload/v1/properties/a.jpg"],
  parking: true,
};

const createProperty = (overrides: Record<string, unknown>) =>
  Property.create({ ...baseProperty, ...overrides });

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Property.init();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Property.deleteMany({});
  await createProperty({ ref: "REF-1", location: "sousse", propertyType: "villa" });
  await createProperty({ ref: "REF-2", location: "sousse", propertyType: "appartement" });
  await createProperty({ ref: "REF-3", location: "hammam_sousse", propertyType: "villa" });
});

describe("searchProperties filter logic", () => {
  it("filters by location and type together", async () => {
    const { properties, total } = await propertiesService.searchProperties(
      { location: "sousse", type: "villa" },
      { page: 1, limit: 16 },
    );

    expect(total).toBe(1);
    expect(properties).toHaveLength(1);
    expect((properties[0] as { ref: string }).ref).toBe("REF-1");
  });

  it("ignores location=none and type=no filters", async () => {
    const { total } = await propertiesService.searchProperties(
      { location: "none", type: "none" },
      { page: 1, limit: 16 },
    );
    expect(total).toBe(3);
  });

  it("filters by location alone", async () => {
    const { total } = await propertiesService.searchProperties(
      { location: "hammam_sousse" },
      { page: 1, limit: 16 },
    );
    expect(total).toBe(1);
  });

  it("counts all matches while paginating", async () => {
    const page1 = await propertiesService.searchProperties(
      { type: "villa" },
      { page: 1, limit: 1 },
    );
    const page2 = await propertiesService.searchProperties(
      { type: "villa" },
      { page: 2, limit: 1 },
    );

    expect(page1.total).toBe(2);
    expect(page1.properties).toHaveLength(1);
    expect(page2.properties).toHaveLength(1);
    expect(
      (page1.properties[0] as { ref: string }).ref,
    ).not.toBe((page2.properties[0] as { ref: string }).ref);
  });
});

describe("GET /api/properties/search", () => {
  it("returns matching properties and the total count header", async () => {
    const response = await request(app).get(
      "/api/properties/search?location=sousse&type=villa",
    );

    expect(response.status).toBe(200);
    expect(response.headers["x-total-count"]).toBe("1");
    expect(response.body as Array<{ ref: string }>).toHaveLength(1);
    expect((response.body as Array<{ ref: string }>)[0].ref).toBe("REF-1");
  });

  it("returns everything when no filters are passed", async () => {
    const response = await request(app).get("/api/properties/search");

    expect(response.status).toBe(200);
    expect(response.headers["x-total-count"]).toBe("3");
  });

  it("rejects unknown locations", async () => {
    const response = await request(app).get(
      "/api/properties/search?location=paris",
    );

    expect(response.status).toBe(400);
    expect(response.body as { error: string }).toEqual({
      error: "Invalid query parameters",
    });
  });
});

describe("GET /api/properties/:id", () => {
  it("returns a property by id", async () => {
    const created = await createProperty({ ref: "REF-BY-ID" });

    const response = await request(app).get(`/api/properties/${created._id}`);

    expect(response.status).toBe(200);
    expect((response.body as { ref: string }).ref).toBe("REF-BY-ID");
  });

  it("rejects malformed ids", async () => {
    const response = await request(app).get("/api/properties/not-an-id");

    expect(response.status).toBe(400);
    expect(response.body as { error: string }).toEqual({
      error: "Invalid property id",
    });
  });

  it("returns 404 for a well-formed but unknown id", async () => {
    const response = await request(app).get(
      "/api/properties/507f1f77bcf86cd799439011",
    );

    expect(response.status).toBe(404);
    expect(response.body as { error: string }).toEqual({
      error: "Property not found",
    });
  });
});
