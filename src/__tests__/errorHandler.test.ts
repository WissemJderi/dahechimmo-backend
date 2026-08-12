import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import express from "express";
import multer from "multer";
import request from "supertest";
import { errorHandler } from "../middleware/errorHandler";

const makeApp = (err: unknown) => {
  const app = express();
  app.use((_req, _res, next) => next(err));
  app.use(errorHandler);
  return app;
};

describe("errorHandler", () => {
  beforeAll(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("returns 413 for LIMIT_FILE_SIZE", async () => {
    const err = new multer.MulterError("LIMIT_FILE_SIZE");

    const response = await request(makeApp(err)).get("/");

    expect(response.status).toBe(413);
    expect(response.body as { error: string }).toEqual({
      error: "File too large",
    });
  });

  it("returns 400 for other multer errors", async () => {
    const err = new multer.MulterError("LIMIT_UNEXPECTED_FILE");

    const response = await request(makeApp(err)).get("/");

    expect(response.status).toBe(400);
    expect(response.body as { error: string }).toEqual({
      error: "Unexpected field",
    });
  });

  it("uses the custom status and message of http errors", async () => {
    const err = { status: 418, message: "teapot" };

    const response = await request(makeApp(err)).get("/");

    expect(response.status).toBe(418);
    expect(response.body as { message: string }).toEqual({ message: "teapot" });
  });

  it("returns 500 for unknown errors", async () => {
    const response = await request(makeApp(new Error("boom"))).get("/");

    expect(response.status).toBe(500);
    expect((response.body as { message: string }).message).toBe("boom");
  });
});