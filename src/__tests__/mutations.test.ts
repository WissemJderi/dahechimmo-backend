import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../app";
import propertiesService from "../services/propertiesService";
import { cloudinary } from "../config/cloudinary";
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

// The router reads multipart fields from req.body (filled by express.json for
// JSON requests) and uploads from req.files. Mocking multer as "one fake
// upload" keeps the tests off the network while exercising the real handler.
const fakeUpload = {
  path: "https://res.cloudinary.com/dummy/image/upload/v1/properties/new-0.jpg",
};

vi.mock("../config/cloudinary", () => ({
  upload: {
    array: () => (req: { files?: unknown[] }, _res: unknown, next: () => void) => {
      req.files = [
        {
          path: "https://res.cloudinary.com/dummy/image/upload/v1/properties/new-0.jpg",
        },
      ];
      next();
    },
  },
  cloudinary: {
    uploader: { destroy: vi.fn().mockResolvedValue({ result: "ok" }) },
  },
}));

const mockedService = vi.mocked(propertiesService);
const mockedDestroy = vi.mocked(cloudinary.uploader.destroy);

const validToken = jwt.sign({ username: "admin" }, SECRET, { expiresIn: "7d" });
const auth = { Authorization: `Bearer ${validToken}` };
const id = "507f1f77bcf86cd799439011";

const existingImages = [
  "https://res.cloudinary.com/dummy/image/upload/v1/properties/old-1.jpg",
  "https://res.cloudinary.com/dummy/image/upload/v1/properties/old-2.jpg",
];

const existingProperty = {
  _id: id,
  title: "Old title",
  ref: "REF-1",
  description: "old description",
  price: 100,
  propertyType: "appartement",
  location: "sousse",
  area: 60,
  status: "sale",
  images: existingImages,
};

const validBody = {
  title: "New property",
  ref: "REF-NEW",
  description: "desc",
  price: 100,
  propertyType: "appartement",
  location: "sousse",
  area: 60,
  status: "sale",
  parking: false,
};

const updateCallImages = () =>
  (mockedService.updateProperty.mock.calls[0][1] as { images: string[] }).images;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/properties", () => {
  it("creates a property and returns 201", async () => {
    mockedService.addProperty.mockResolvedValue(existingProperty as never);

    const response = await request(app)
      .post("/api/properties")
      .set(auth)
      .send(validBody);

    expect(response.status).toBe(201);
    expect(mockedService.addProperty).toHaveBeenCalledTimes(1);
    expect(mockedDestroy).not.toHaveBeenCalled();
  });

  it("returns 409 for a duplicate ref and cleans up the uploaded image", async () => {
    const dup = Object.assign(new Error("E11000 duplicate key"), { code: 11000 });
    mockedService.addProperty.mockRejectedValue(dup);

    const response = await request(app)
      .post("/api/properties")
      .set(auth)
      .send(validBody);

    expect(response.status).toBe(409);
    expect(response.body as { error: string }).toEqual({
      error: "Property reference already exists",
    });
    expect(mockedDestroy).toHaveBeenCalledWith("properties/new-0");
  });

  it("returns 400 for invalid data and cleans up the uploaded image", async () => {
    const response = await request(app)
      .post("/api/properties")
      .set(auth)
      .send({ ...validBody, price: 0, title: "" });

    expect(response.status).toBe(400);
    expect(mockedService.addProperty).not.toHaveBeenCalled();
    expect(mockedDestroy).toHaveBeenCalledWith("properties/new-0");
  });
});

describe("PUT /api/properties/:id", () => {
  beforeEach(() => {
    mockedService.getProperty.mockResolvedValue(existingProperty as never);
    mockedService.updateProperty.mockResolvedValue({
      ...existingProperty,
      title: "New title",
    } as never);
  });

  it("falls back to the stored images when existingImages is not sent", async () => {
    const response = await request(app)
      .put(`/api/properties/${id}`)
      .set(auth)
      .send({ ...validBody, ref: "REF-1" });

    expect(response.status).toBe(200);
    expect(updateCallImages()).toEqual([...existingImages, fakeUpload.path]);
  });

  it("merges existing images with new uploads", async () => {
    const response = await request(app)
      .put(`/api/properties/${id}`)
      .set(auth)
      .send({
        ...validBody,
        ref: "REF-1",
        existingImages: JSON.stringify(existingImages),
      });

    expect(response.status).toBe(200);
    expect(updateCallImages()).toEqual([...existingImages, fakeUpload.path]);
  });

  it("rejects a merge that would exceed 5 images and discards the new upload", async () => {
    const fiveExisting = Array.from(
      { length: 5 },
      (_, i) =>
        `https://res.cloudinary.com/dummy/image/upload/v1/properties/old-${i}.jpg`,
    );

    const response = await request(app)
      .put(`/api/properties/${id}`)
      .set(auth)
      .send({
        ...validBody,
        ref: "REF-1",
        existingImages: JSON.stringify(fiveExisting),
      });

    expect(response.status).toBe(400);
    expect(response.body as { error: string }).toEqual({
      error: "Maximum 5 images allowed",
    });
    expect(mockedService.updateProperty).not.toHaveBeenCalled();
    expect(mockedDestroy).toHaveBeenCalledTimes(1);
    expect(mockedDestroy).toHaveBeenCalledWith("properties/new-0");
  });

  it("returns 404 and discards the upload when the property does not exist", async () => {
    mockedService.getProperty.mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/properties/${id}`)
      .set(auth)
      .send({ ...validBody, ref: "REF-1" });

    expect(response.status).toBe(404);
    expect(mockedDestroy).toHaveBeenCalledWith("properties/new-0");
    expect(mockedService.updateProperty).not.toHaveBeenCalled();
  });

  it("deletes images the client dropped from the list", async () => {
    await request(app)
      .put(`/api/properties/${id}`)
      .set(auth)
      .send({
        ...validBody,
        ref: "REF-1",
        existingImages: JSON.stringify([existingImages[0]]),
      });

    expect(mockedDestroy).toHaveBeenCalledWith("properties/old-2");
    expect(mockedDestroy).toHaveBeenCalledTimes(1);
  });
});

describe("DELETE /api/properties/:id", () => {
  it("requires authentication", async () => {
    const response = await request(app).delete(`/api/properties/${id}`);

    expect(response.status).toBe(401);
    expect(mockedService.getProperty).not.toHaveBeenCalled();
  });

  it("rejects malformed ids", async () => {
    const response = await request(app)
      .delete("/api/properties/not-an-id")
      .set(auth);

    expect(response.status).toBe(400);
    expect(mockedService.getProperty).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown id", async () => {
    mockedService.getProperty.mockResolvedValue(null);

    const response = await request(app)
      .delete(`/api/properties/${id}`)
      .set(auth);

    expect(response.status).toBe(404);
    expect(mockedDestroy).not.toHaveBeenCalled();
    expect(mockedService.deleteProperty).not.toHaveBeenCalled();
  });

  it("destroys every image then deletes the property", async () => {
    mockedService.getProperty.mockResolvedValue(existingProperty as never);
    mockedService.deleteProperty.mockResolvedValue(existingProperty as never);

    const response = await request(app)
      .delete(`/api/properties/${id}`)
      .set(auth);

    expect(response.status).toBe(200);
    expect(mockedDestroy).toHaveBeenCalledTimes(2);
    expect(mockedDestroy).toHaveBeenCalledWith("properties/old-1");
    expect(mockedDestroy).toHaveBeenCalledWith("properties/old-2");
    expect(mockedService.deleteProperty).toHaveBeenCalledWith(id);
  });
});
