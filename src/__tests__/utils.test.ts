import { describe, expect, it } from "vitest";
import { getPublicIdFromUrl } from "../utils";

describe("getPublicIdFromUrl", () => {
  it("extracts the public id after the version segment", () => {
    expect(
      getPublicIdFromUrl(
        "https://res.cloudinary.com/demo/image/upload/v1234567/properties/171234-photo.jpg",
      ),
    ).toBe("properties/171234-photo");
  });

  it("removes only the extension, keeping folders and dots in the name", () => {
    expect(
      getPublicIdFromUrl(
        "https://res.cloudinary.com/demo/image/upload/v1/properties/my.house.final.webp",
      ),
    ).toBe("properties/my.house.final");
  });

  // shortcut: without a /vN/ segment findIndex returns -1 and the last path
  // segment (filename) is silently dropped — fine for cloudinary URLs, upgrade
  // to a parsed URL if non-cloudinary URLs are ever passed
  it("drops the filename when no version segment exists", () => {
    expect(getPublicIdFromUrl("https://example.com/foo/bar.jpg")).toBe(
      "https://example.com/foo/bar",
    );
  });
});
