import { cookies, headers } from "next/headers";

export async function getServerSideCountry(): Promise<string> {
    const cookieStore = await cookies();
    const headerList = await headers();

    // Priority 1: Check for Vercel country header
    const vercelCountry = headerList.get("x-vercel-ip-country");
    if (vercelCountry) {
        if (vercelCountry.toUpperCase() === "NP") return "nepal";
        if (vercelCountry.toUpperCase() === "IN") return "india";
    }

    // Priority 2: Check for a session/cookie (though likely encrypted in this app)
    // For now, let's keep it simple: if no Vercel header, default to nepal 
    // but try to see if there's any unencrypted hint.

    return "nepal"; // Default base
}
