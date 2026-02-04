import nodemailer from "nodemailer";
export const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    const mailOptions = {
        from: `"Nova App" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
    };
    await transporter.sendMail(mailOptions);
};
//# sourceMappingURL=sendEmail.js.map