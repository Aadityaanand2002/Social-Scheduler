import nodemailer from "nodemailer";
export const sendEmail = async (options) => {
    // If SMTP credentials aren't set, just log it (useful for local testing)
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log("-----------------------------------------");
        console.log(`[Email Mock] To: ${options.to}`);
        console.log(`[Email Mock] Subject: ${options.subject}`);
        console.log(`[Email Mock] Text: ${options.text}`);
        console.log("-----------------------------------------");
        return;
    }
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    const mailOptions = {
        from: `"${options.fromName || 'Social Scheduler'}" <${options.fromEmail || process.env.SMTP_USER}>`,
        replyTo: options.replyTo,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };
    await transporter.sendMail(mailOptions);
};
