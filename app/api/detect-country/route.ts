import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const IP_COUNTRY_COOKIE_NAME = "dreamy-eyes-ip-country";
const IP_COUNTRY_COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds

// Server-side only secret key (NOT exposed to client)
const SECRET_KEY = process.env.COOKIE_SECRET_KEY || "your-secret-key-change-in-production";

// Derive a 32-byte encryption key from the secret
function getEncryptionKey(): Buffer {
  return crypto.createHash("sha256").update(SECRET_KEY).digest();
}

// Encrypt the country value
function encryptValue(value: string): string {
  const iv = crypto.randomBytes(16);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(value, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encryptedData
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

// Decrypt the country value
function decryptValue(encryptedValue: string): string | null {
  try {
    const parts = encryptedValue.split(":");
    if (parts.length !== 3) return null;

    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encrypted = parts[2];

    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {

    return null;
  }
}

export function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "Unknown";

  // Example: detect country from Cloudflare / Vercel headers
  const country =
    req.headers.get("x-vercel-ip-country") || // Vercel
    req.headers.get("cf-ipcountry") || // Cloudflare
    "Unknown";

  const isIndia = country === "IN";
  const isNepal = country === "NP";

  // Map country code to country name for consistency
  let countryName = "nepal"; // Default to Nepal
  if (isIndia) {
    countryName = "india";
  } else if (isNepal) {
    countryName = "nepal";
  }


  // Encrypt the country value
  const encryptedCountry = encryptValue(countryName);

  // Create response
  const response = NextResponse.json({
    ip,
    country,
    countryName,
    isIndia,
    isNepal,
  });

  // Set encrypted country cookie
  response.cookies.set(IP_COUNTRY_COOKIE_NAME, encryptedCountry, {
    maxAge: IP_COUNTRY_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

