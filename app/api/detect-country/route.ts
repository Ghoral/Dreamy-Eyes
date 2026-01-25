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

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const { searchParams } = new URL(req.url);
  const hint = searchParams.get("hint")?.toUpperCase();

  console.log(`[DetectCountry] Incoming Request IP: ${ip} | Client Hint: ${hint || 'None'}`);

  // Detect country from Cloudflare / Vercel headers
  let country =
    req.headers.get("x-vercel-ip-country") || // Vercel
    req.headers.get("cf-ipcountry") || // Cloudflare
    hint || // Prioritize browser hint for local dev/VPN testing
    "Unknown";

  if (country !== "Unknown") {
    console.log(`[DetectCountry] Detected via Header: ${country}`);
  }

  console.log(`[DetectCountry] Header Detection: ${country}`);

  // Fallback for local development or missing headers
  if (country === "Unknown" || !country) {
    try {
      // Use a fast, free GeoIP service for fallback detection (useful for local VPN testing)
      let geoRes = await fetch("https://ipapi.co/json/", { cache: 'no-store' });
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.country_code) {
          country = geoData.country_code;
          console.log(`[DetectCountry] GeoIP Fallback (ipapi.co): ${country}`);
        }
      } else {
        // Try second fallback if first one fails
        console.log(`[DetectCountry] ipapi.co failed, trying ip-api.com fallback...`);
        geoRes = await fetch("http://ip-api.com/json/", { cache: 'no-store' });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.countryCode) {
            country = geoData.countryCode;
            console.log(`[DetectCountry] GeoIP Fallback (ip-api.com): ${country}`);
          }
        }
      }
    } catch (e) {
      console.error(`[DetectCountry] GeoIP Fallback Error:`, e);
    }
  }

  const isIndia = country === "IN";
  const isNepal = country === "NP";

  // Map country code to proper country name
  let countryName = "Nepal"; // Ultimate fallback
  if (country !== "Unknown") {
    try {
      const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
      countryName = regionNames.of(country) || country;
    } catch (e) {
      console.error(`[DetectCountry] Intl.DisplayNames Error for ${country}:`, e);
      countryName = isIndia ? "India" : (isNepal ? "Nepal" : country);
    }
  }

  console.log(`[DetectCountry] Final Resolved Name: ${countryName}`);

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
