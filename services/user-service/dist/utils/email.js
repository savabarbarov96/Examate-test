import nodemailer from "nodemailer";
export const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        // @ts-ignore
        host: "mail.exa-ms.com",
        secure: false,
        port: "587",
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    const mailOptions = {
        from: '"ExaMS" <exams@exa-ms.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    await transporter.sendMail(mailOptions);
};
