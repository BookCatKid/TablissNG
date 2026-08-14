import { LOCATION_REFRESH_INTERVAL, shouldRefreshLocation } from "./api";

describe("shouldRefreshLocation", () => {
  const now = 2_000_000;

  it("requests a location when coordinates are missing", () => {
    expect(
      shouldRefreshLocation(
        { latitude: undefined, longitude: undefined, locationUpdatedAt: now },
        now,
      ),
    ).toBe(true);
  });

  it("does not request again while the successful lookup is fresh", () => {
    expect(
      shouldRefreshLocation(
        { latitude: 1, longitude: 2, locationUpdatedAt: now },
        now + LOCATION_REFRESH_INTERVAL - 1,
      ),
    ).toBe(false);
  });

  it("refreshes after the cooldown expires", () => {
    expect(
      shouldRefreshLocation(
        { latitude: 1, longitude: 2, locationUpdatedAt: now },
        now + LOCATION_REFRESH_INTERVAL,
      ),
    ).toBe(true);
  });
});
