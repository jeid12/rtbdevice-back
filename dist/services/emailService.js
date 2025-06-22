"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});
const sendOtpEmail = async (to, otp) => {
    await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to,
        subject: 'RTB Assets Management - OTP Code',
        html: `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="background-color: #006633; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            <h2 style="color: #ffffff; margin: 0;">RTB Assets Management</h2>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px;">Dear User,</p>
            <p style="font-size: 16px;">
              You recently attempted to sign in to <strong>RTB Assets Management</strong>. Please use the following One-Time Password (OTP) to complete your login:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; padding: 14px 28px; font-size: 22px; background-color: #FFD700; color: #000; font-weight: bold; border-radius: 8px; letter-spacing: 2px;">
                ${otp}
              </span>
            </div>
            <p style="font-size: 16px;">
              If you did not request this code, you can safely ignore this email.
            </p>
            <p style="font-size: 16px;">Kind regards,<br><strong>RTB ICT Department</strong></p>
          </div>
          <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
            © ${new Date().getFullYear()} Rwanda TVET Board – All rights reserved.
          </div>
        </div>
      </div>
    `,
    });
};
exports.sendOtpEmail = sendOtpEmail;
