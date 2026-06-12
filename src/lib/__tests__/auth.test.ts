// @vitest-environment node
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { jwtVerify } from "jose";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";
import { createSession } from "../auth";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "development-secret-key"
);

let set: ReturnType<typeof vi.fn>;

beforeEach(() => {
  set = vi.fn();
  (cookies as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ set });
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

test("createSession stores the token in the auth-token cookie", async () => {
  await createSession("user-123", "alice@example.com");

  expect(set).toHaveBeenCalledTimes(1);
  const [name, token] = set.mock.calls[0];
  expect(name).toBe("auth-token");
  expect(typeof token).toBe("string");
  expect((token as string).length).toBeGreaterThan(0);
});

test("createSession signs a JWT carrying the userId and email", async () => {
  await createSession("user-123", "alice@example.com");

  const token = set.mock.calls[0][1];
  const { payload } = await jwtVerify(token, SECRET);
  expect(payload.userId).toBe("user-123");
  expect(payload.email).toBe("alice@example.com");
});

test("createSession sets hardened cookie options", async () => {
  await createSession("user-123", "alice@example.com");

  const options = set.mock.calls[0][2];
  expect(options.httpOnly).toBe(true);
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
  expect(options.expires).toBeInstanceOf(Date);
});

test("createSession expires about 7 days out", async () => {
  const before = Date.now();
  await createSession("user-123", "alice@example.com");

  const expected = before + 7 * 24 * 60 * 60 * 1000;
  const options = set.mock.calls[0][2];
  // Allow a few seconds of slack for execution time.
  expect(Math.abs(options.expires.getTime() - expected)).toBeLessThan(5000);

  const token = set.mock.calls[0][1];
  const { payload } = await jwtVerify(token, SECRET);
  expect(
    Math.abs(new Date(payload.expiresAt as string).getTime() - expected)
  ).toBeLessThan(5000);
});

test("createSession marks the cookie secure in production", async () => {
  vi.stubEnv("NODE_ENV", "production");
  await createSession("user-123", "alice@example.com");

  expect(set.mock.calls[0][2].secure).toBe(true);
});

test("createSession leaves the cookie non-secure outside production", async () => {
  vi.stubEnv("NODE_ENV", "test");
  await createSession("user-123", "alice@example.com");

  expect(set.mock.calls[0][2].secure).toBe(false);
});
