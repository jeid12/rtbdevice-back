import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendOtpEmail } from './emailService';

const JWT_SECRET = process.env.JWT_SECRET!;

function generateOtp(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString().substring(0, length);
}

export const userService = {
  register: async (data: any) => {
    if (Array.isArray(data)) {
      throw new Error('Invalid registration data');
    }
    const userRepo = AppDataSource.getRepository(User);
    const existing = await userRepo.findOne({ where: { email: data.email } });
    if (existing) throw new Error('Email already in use');
    const hashed = await bcrypt.hash(data.password, 10);
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    const user = userRepo.create({ ...data, password: hashed, otp, otpExpiresAt });
    const savedUser = await userRepo.save(user) as unknown as User;
    await sendOtpEmail(savedUser.email, otp);
    return { id: savedUser.id, email: savedUser.email, message: 'OTP sent to email' };
  },

  login: async ({ email, password }: { email: string; password: string }) => {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });
    if (!user) throw new Error('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid credentials');
    // Generate and send OTP
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await userRepo.save(user);
    await sendOtpEmail(user.email, otp);
    return { message: 'OTP sent to your email' };
  },

  verifyOtp: async ({ email, otp }: { email: string; otp: string }) => {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });
    if (!user) throw new Error('User not found');
    if (!user.otp || !user.otpExpiresAt || user.otp !== otp || user.otpExpiresAt < new Date()) {
      throw new Error('Invalid or expired OTP');
    }
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await userRepo.save(user);
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    return { token };
  },
};
