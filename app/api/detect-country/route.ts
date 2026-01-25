import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const IP_COUNTRY_COOKIE_NAME = "dreamy-eyes-ip-country";
const IP_COUNTRY_COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds
const SECRET_KEY = process.env.COOKIE_SECRET_KEY || "your-secret-key-change-in-production";

function getEncryptionKey(): Buffer {
  return crypto.createHash("sha256").update(SECRET_KEY).digest();
}

function encryptValue(value: string): string {
  const iv = crypto.randomBytes(16);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(value, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hint = searchParams.get("hint")?.toUpperCase();

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  // 1. Resolve Country Code (Hint > Vercel Header > Unknown)
  const countryCode = (hint && hint !== "UNKNOWN" && hint !== "UNDEFINED" && hint !== "")
    ? hint
    : (req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "Unknown");

  // 2. Resolve Full Name
  let countryName = "India"; // Default fallback
  if (countryCode !== "Unknown") {
    try {
      const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
      countryName = regionNames.of(countryCode) || "India";
    } catch (e) {
      if (countryCode === "IN") countryName = "India";
      else if (countryCode === "NP") countryName = "Nepal";
      else countryName = countryCode;
    }
  }

  const response = NextResponse.json({
    ip,
    country: countryCode,
    countryName,
    isIndia: countryCode === "IN" || countryName === "India",
    isNepal: countryCode === "NP",
  });

  // Set the encrypted cookie
  const encryptedValue = encryptValue(countryName);
  response.cookies.set(IP_COUNTRY_COOKIE_NAME, encryptedValue, {
    maxAge: IP_COUNTRY_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
