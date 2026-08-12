import { afterEach, describe, expect, it, vi } from "vitest";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";

describe("GET /health", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 503 when the database is not connected", async () => {
    vi.spyOn(mongoose.connection, "readyState", "get").mockReturnValue(0);

    const response = await request(app).get("/health");

    expect(response.status).toBe(503);
    expect(response.body as { status: string }).toEqual({
      status: "unavailable",
    });
  });

  it("returns 200 when the database is connected", async () => {
    vi.spyOn(mongoose.connection, "readyState", "get").mockReturnValue(1);

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body as { status: string }).toEqual({ status: "ok" });
  });
});

describe("unknown routes", () => {
  it("returns JSON 404 instead of the default HTML page", async () => {
    const response = await request(app).get("/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body as { error: string }).toEqual({
      error: "Route not found",
    });
  });
});