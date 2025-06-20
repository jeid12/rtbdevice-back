import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendOtpEmail = async (to: string, otp: string) => {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: 'RTB Assets Management - OTP Code',
    text: `You attempetd to login to RTB Assets Management here is your OTP: ${otp}
    If you did not attempt to login, please ignore this email.`,
  });
};
