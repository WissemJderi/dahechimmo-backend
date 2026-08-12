import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app";

describe("POST /api/auth/login", () => {
  it("returns a token for valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin", password: "admin2026" });

    expect(response.status).toBe(200);
    expect((response.body as { username: string }).username).toBe("admin");
    expect((response.body as { token: string }).token).toBeTruthy();
  });

  it("rejects wrong credentials with 401", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ username: "admin", password: "wrong-password" });

    expect(response.status).toBe(401);
    expect(response.body as { error: string }).toEqual({
      error: "invalid username or password",
    });
  });

  it("rejects missing body with 400", async () => {
    const response = await request(app).post("/api/auth/login");

    expect(response.status).toBe(400);
    expect(response.body as { error: string }).toEqual({
      error: "username and password required",
    });
  });
});

describe("POST /api/auth/login rate limiting", () => {
  it("returns 429 after too many attempts", async () => {
    const attempt = () =>
      request(app)
        .post("/api/auth/login")
        .send({ username: "admin", password: "wrong-password" });

    let lastStatus = 0;
    for (let i = 0; i < 11; i += 1) {
      const response = await attempt();
      lastStatus = response.status;
    }

    expect(lastStatus).toBe(429);
    expect((await attempt()).body as { error: string }).toEqual({
      error: "Too many requests",
    });
  });
});