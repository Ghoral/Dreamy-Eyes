import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import nodemailer from "npm:nodemailer@^6.9.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function compileTemplate(template: string, data: Record<string, any>): string {
    if (!template) return "";
    return template.replace(/\{\{(.*?)\}\}/g, (match, key) => {
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

/**
 * Build applicators HTML section if order has applicators
 */
function buildApplicatorsSection(applicators: any[]): string {
    if (!applicators || applicators.length === 0) return "";

    const rows = applicators.map(a => `
      <tr>
        <td style="font-size:13px;font-weight:600;color:#2d0a1e;padding:11px 16px;border-bottom:1px solid #fde8f4;width:40%;">${a.name ?? 'Applicator'}</td>
        <td style="font-size:13px;color:#333;padding:11px 16px;border-bottom:1px solid #fde8f4;">
          Qty: ${a.quantity} &nbsp;·&nbsp; ${a.price}
        </td>
      </tr>`).join('');

    return `
  <p style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#e91e8c;margin-bottom:10px;">Applicators</p>
  <div style="border:1px solid #f8c8e4;border-radius:8px;overflow:hidden;margin-bottom:20px;">
    <table style="width:100%;border-collapse:collapse;">
      ${rows}
    </table>
  </div>`;
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const payload = await req.json()
        const { data, title, subject, html, sender, receiver } = payload
        console.log('data -> ', data);

        const rawSubject = subject || title || "New Notification";

        // Build receiver string
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
            throw new Error("Missing receiver email address.");
        }

        const templateData = data || {};

        // Build applicators section and inject into templateData
        const applicatorsSection = buildApplicatorsSection(templateData.applicators ?? []);
        templateData.applicators_section = applicatorsSection;

        // Format date nicely
        if (templateData.created_at) {
            templateData.created_at = new Date(templateData.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        }

        const finalHtml = compileTemplate(html, templateData);
        const finalSubject = compileTemplate(rawSubject, templateData);

        const transporter = nodemailer.createTransport({
            host: Deno.env.get('EMAIL_HOST'),
            port: Number(Deno.env.get('EMAIL_PORT')),
            secure: true,
            auth: {
                user: Deno.env.get('EMAIL_USER'),
                pass: Deno.env.get('EMAIL_PASS'),
            },
        })

        const mailOptions = {
            from: sender,
            to,
            subject: finalSubject,
            html: finalHtml,
        }

        const info = await transporter.sendMail(mailOptions)

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