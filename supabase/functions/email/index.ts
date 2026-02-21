import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import nodemailer from "npm:nodemailer@^6.9.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Simple template engine to replace {{key}} with value from data object
 */
function compileTemplate(template: string, data: Record<string, any>): string {
    if (!template) return "";
    return template.replace(/\{\{(.*?)\}\}/g, (match, key) => {
        // Dig into nested objects if needed (e.g. {{user.name}})
        const keys = key.trim().split('.');
        let value: any = data;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                value = undefined;
                break;
            }
        }

        return value !== undefined ? String(value) : match;
    });
}

serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const payload = await req.json()
        const { data, title, subject, html, sender, receiver } = payload
        console.log('data -> ', data);

        // 1. Handle Subject (fallback to title)
        const rawSubject = subject || title || "New Notification";

        // 2. Handle Receiver (could be string, array of strings, or array of objects)
        let to = "";
        if (Array.isArray(receiver)) {
            to = receiver.map(r => {
                if (typeof r === 'string') return r;
                if (typeof r === 'object' && r !== null && r.email) {
                    return r.name ? `"${r.name}" <${r.email}>` : r.email;
                }
                return null;
            }).filter(Boolean).join(", ");
        } else if (typeof receiver === "string" && receiver.length > 0) {
            to = receiver;
        }

        if (!to || to === "") {
            // If receiver is empty, check if we should default to admin or throw error
            throw new Error("Missing receiver email address.");
        }

        // 3. Process dynamic data (Handle both root level and nested data)
        // The user mentioned data format is {name: "lovish", ...}
        const templateData = data || {};

        const finalHtml = compileTemplate(html, templateData);
        const finalSubject = compileTemplate(rawSubject, templateData);

        // SMTP configuration from Supabase Secrets
        const transporter = nodemailer.createTransport({
            host: Deno.env.get('EMAIL_HOST'),
            port: Number(Deno.env.get('EMAIL_PORT')),
            secure: Deno.env.get('EMAIL_SECURE') === 'true',
            auth: {
                user: Deno.env.get('EMAIL_USER'),
                pass: Deno.env.get('EMAIL_PASS'),
            },
        })

        const mailOptions = {
            from: sender || Deno.env.get('EMAIL_FROM'),
            to,
            subject: finalSubject,
            html: finalHtml,
        }

        const info = await transporter.sendMail(mailOptions)
        console.log('Message sent: %s', info.messageId)

        return new Response(
            JSON.stringify({ success: true, messageId: info.messageId }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error: any) {
        console.error('Error sending email:', error.message)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
