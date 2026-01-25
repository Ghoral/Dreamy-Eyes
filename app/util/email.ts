import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async ({
    to,
    subject,
    html,
    text,
}: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
}) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            text,
            html,
        });
        console.log("Email sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
};
