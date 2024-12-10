import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email: string, code: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.naver.com',
      port: 587,
      secure: false, // TLS 사용
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Stellar Link Verification Code',
    text: `Your verification code is: ${code}`,
  });
};
