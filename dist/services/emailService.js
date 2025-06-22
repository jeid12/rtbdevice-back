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
        text: `You attempetd to login to RTB Assets Management here is your OTP: ${otp}
    If you did not attempt to login, please ignore this email.`,
    });
};
exports.sendOtpEmail = sendOtpEmail;
