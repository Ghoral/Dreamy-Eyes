import { cookies, headers } from "next/headers";
import crypto from "crypto";

const IP_COUNTRY_COOKIE_NAME = "dreamy-eyes-ip-country";
const SECRET_KEY = process.env.COOKIE_SECRET_KEY || "your-secret-key-change-in-production";

// Derive a 32-byte encryption key from the secret
function getEncryptionKey(): Buffer {
    return crypto.createHash("sha256").update(SECRET_KEY).digest();
}

// Decrypt the country value
export function decryptCountryValue(encryptedValue: string): string | null {
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

export async function getServerSideCountry(): Promise<string> {
    try {
        const cookieStore = await cookies();
        const headerList = await headers();

        // 1. Check for infrastructure headers
        const vercelCountry = headerList.get("x-vercel-ip-country") || headerList.get("cf-ipcountry");
        if (vercelCountry) {
            const code = vercelCountry.toUpperCase();
            if (code === "NP") return "nepal";
            if (code === "IN") return "india";
        }

        // 2. Check persistent encrypted cookie
        const cookie = cookieStore.get(IP_COUNTRY_COOKIE_NAME);
        if (cookie?.value) {
            const decrypted = decryptCountryValue(cookie.value);
            if (decrypted) return decrypted.toLowerCase();
        }

        // Default to India on failure
        return "india";
    } catch (e) {
        return "india";
    }
}
