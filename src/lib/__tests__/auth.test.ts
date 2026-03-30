import { webcrypto } from "crypto";
Object.defineProperty(globalThis, "crypto", { value: webcrypto });

import { describe, test, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

vi.mock("server-only", () => ({}));

const mockCookieSet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ set: mockCookieSet })),
}));

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

describe("createSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("sets an httpOnly cookie", async () => {
    const { createSession } = await import("@/lib/auth");
    await createSession("user-1", "user@example.com");

    expect(mockCookieSet).toHaveBeenCalledOnce();
    const [, , options] = mockCookieSet.mock.calls[0];
    expect(options.httpOnly).toBe(true);
  });

  test("cookie name is auth-token", async () => {
    const { createSession } = await import("@/lib/auth");
    await createSession("user-1", "user@example.com");

    const [name] = mockCookieSet.mock.calls[0];
    expect(name).toBe("auth-token");
  });

  test("cookie expires approximately 7 days from now", async () => {
    const before = Date.now();
    const { createSession } = await import("@/lib/auth");
    await createSession("user-1", "user@example.com");
    const after = Date.now();

    const [, , options] = mockCookieSet.mock.calls[0];
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    expect(options.expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
    expect(options.expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
  });

  test("token is a valid JWT containing userId and email", async () => {
    const { createSession } = await import("@/lib/auth");
    await createSession("user-42", "hello@test.com");

    const [, token] = mockCookieSet.mock.calls[0];
    const { payload } = await jwtVerify(token, JWT_SECRET);
    expect(payload.userId).toBe("user-42");
    expect(payload.email).toBe("hello@test.com");
  });

  test("cookie has sameSite lax and path /", async () => {
    const { createSession } = await import("@/lib/auth");
    await createSession("user-1", "user@example.com");

    const [, , options] = mockCookieSet.mock.calls[0];
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
  });
});
