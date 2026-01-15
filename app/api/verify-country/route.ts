import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const IP_COUNTRY_COOKIE_NAME = "dreamy-eyes-ip-country";

// Server-side only secret key (NOT exposed to client)
const SECRET_KEY = process.env.COOKIE_SECRET_KEY || "your-secret-key-change-in-production";

// Derive a 32-byte encryption key from the secret
function getEncryptionKey(): Buffer {
    return crypto.createHash("sha256").update(SECRET_KEY).digest();
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
        console.error("Decryption error:", error);
        return null;
    }
}

export function POST(req: NextRequest) {
    try {
        const encryptedCountry = req.cookies.get(IP_COUNTRY_COOKIE_NAME)?.value;

        if (!encryptedCountry) {
            return NextResponse.json({ valid: false, message: "Missing cookie" }, { status: 400 });
        }

        // Try to decrypt the cookie value
        const decryptedCountry = decryptValue(encryptedCountry);

        if (!decryptedCountry) {
            return NextResponse.json({
                valid: false,
                message: "Cookie decryption failed - may have been tampered with"
            }, { status: 400 });
        }

        return NextResponse.json({
            valid: true,
            country: decryptedCountry,
            message: "Cookie is valid",
        });
    } catch (error) {
        return NextResponse.json({ valid: false, message: "Validation error" }, { status: 500 });
    }
}
