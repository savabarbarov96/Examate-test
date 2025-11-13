import nodemailer from "nodemailer";
export const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: "mail.exa-ms.com",
        secure: true,
        port: "465",
        auth: {
            user: "exams@exa-ms.com",
            pass: "Pao5z39#03Kq8&cf",
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
