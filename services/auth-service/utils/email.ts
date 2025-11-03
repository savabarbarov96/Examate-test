import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    // @ts-ignore
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

  console.log({
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    });
  
  const mailOptions = {
    from: '"ExaMS" <exams@exa-ms.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  console.log({ mailOptions });
  
  await transporter.sendMail(mailOptions);
};
