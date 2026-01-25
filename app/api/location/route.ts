import { NextRequest } from "next/server";

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    // Use 'any' type cast because .geo is a Vercel-specific extension of NextRequest
    const geo = (request as any).geo;
    const countryCode = geo?.country;
    const city = geo?.city;
    const region = geo?.region;

    return Response.json({
        country: countryCode,
        city,
        region
    });
}
