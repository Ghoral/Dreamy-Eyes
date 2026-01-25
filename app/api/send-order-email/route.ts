import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/app/util/email";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderData, customerEmail } = body;

        if (!customerEmail || !orderData) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const { order_id, total_amount, items, first_name, last_name } = orderData;

        const itemsHtml = items
            .map(
                (item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.price}</td>
      </tr>
    `
            )
            .join("");

        const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Order Confirmation</h2>
        <p>Hi ${first_name} ${last_name},</p>
        <p>Thank you for your order! Your order ID is <strong>#${order_id}</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8f8f8;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #eee;">Item</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #eee;">Qty</th>
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #eee;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 10px; font-weight: bold;">${total_amount}</td>
            </tr>
          </tfoot>
        </table>
        
        <p style="text-align: center; color: #888; font-size: 12px; margin-top: 30px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    `;

        const recipients = [customerEmail];
        if (process.env.ADMIN_EMAIL) {
            recipients.push(process.env.ADMIN_EMAIL);
        }

        const result = await sendEmail({
            to: recipients.join(", "),
            subject: `Order Confirmation #${order_id} - Dreamy Eyes`,
            html: emailHtml,
        });

        if (result.success) {
            return NextResponse.json({ message: "Email sent successfully" });
        } else {
            return NextResponse.json(
                { message: "Failed to send email", error: result.error },
                { status: 500 }
            );
        }
    } catch (error: any) {
        return NextResponse.json(
            { message: "Error processing request", error: error.message },
            { status: 500 }
        );
    }
}
