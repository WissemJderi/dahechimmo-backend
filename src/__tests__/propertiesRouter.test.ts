import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../app";
import propertiesService from "../services/propertiesService";
import { SECRET } from "../config/env";

vi.mock("../services/propertiesService", () => ({
  default: {
    getProperties: vi.fn(),
    searchProperties: vi.fn(),
    addProperty: vi.fn(),
    getProperty: vi.fn(),
    deleteProperty: vi.fn(),
    updateProperty: vi.fn(),
  },
}));

const mockedService = vi.mocked(propertiesService);

const validToken = jwt.sign({ username: "admin" }, SECRET, { expiresIn: "7d" });
const auth = { Authorization: `Bearer ${validToken}` };

const existingProperty = {
  _id: "507f1f77bcf86cd799439011",
  title: "Old title",
  ref: "REF-1",
  description: "old description",
  price: 100,
  propertyType: "appartement",
  location: "sousse",
  area: 60,
  status: "sale",
  images: ["https://res.cloudinary.com/dummy/image/upload/properties/old.jpg"],
};

describe("POST /api/properties", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated requests before any upload happens", async () => {
    const response = await request(app).post("/api/properties");

    expect(response.status).toBe(401);
    expect(response.body as { error: string }).toEqual({ error: "token missing" });
    expect(mockedService.addProperty).not.toHaveBeenCalled();
  });

  it("rejects invalid tokens", async () => {
    const response = await request(app)
      .post("/api/properties")
      .set("Authorization", "Bearer not-a-valid-token");

    expect(response.status).toBe(401);
    expect(response.body as { error: string }).toEqual({ error: "invalid token" });
    expect(mockedService.addProperty).not.toHaveBeenCalled();
  });

  it("requires at least one image", async () => {
    const response = await request(app).post("/api/properties").set(auth);

    expect(response.status).toBe(400);
    expect(response.body as { error: string }).toEqual({
      error: "At least one image is required",
    });
  });
});

describe("PUT /api/properties/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedService.getProperty.mockResolvedValue(existingProperty);
    mockedService.updateProperty.mockResolvedValue({
      ...existingProperty,
      title: "New title",
    });
  });

  it("rejects unauthenticated requests before any upload happens", async () => {
    const response = await request(app).put(
      "/api/properties/507f1f77bcf86cd799439011",
    );

    expect(response.status).toBe(401);
    expect(mockedService.updateProperty).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed existingImages", async () => {
    const response = await request(app)
      .put("/api/properties/507f1f77bcf86cd799439011")
      .set(auth)
      .field("existingImages", "[not valid json");

    expect(response.status).toBe(400);
    expect(response.body as { error: string }).toEqual({
      error: "Invalid existingImages",
    });
    expect(mockedService.updateProperty).not.toHaveBeenCalled();
  });

  it("updates the property when authentication and body are valid", async () => {
    const response = await request(app)
      .put("/api/properties/507f1f77bcf86cd799439011")
      .set(auth)
      .field("title", "New title")
      .field("ref", "REF-1")
      .field("description", "new description")
      .field("price", "150")
      .field("propertyType", "appartement")
      .field("location", "sousse")
      .field("area", "70")
      .field("status", "sale");

    expect(response.status).toBe(200);
    expect((response.body as { title: string }).title).toBe("New title");
    expect(mockedService.updateProperty).toHaveBeenCalledTimes(1);
  });
});