import { NextRequest, NextResponse } from "next/server";

const IP_COUNTRY_COOKIE_NAME = "dreamy-eyes-ip-country";
const IP_COUNTRY_COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds

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

  // Create response
  const response = NextResponse.json({
    ip,
    country,
    countryName,
    isIndia,
    isNepal,
  });

  // Set cookie with country name (24 hours expiry)
  response.cookies.set(IP_COUNTRY_COOKIE_NAME, countryName, {
    maxAge: IP_COUNTRY_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
