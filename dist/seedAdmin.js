"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
const User_1 = require("./entity/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
async function seed() {
    await data_source_1.AppDataSource.initialize();
    const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
    const existing = await userRepo.findOne({ where: { email: 'niyokwizerajd123@gmail.com' } });
    if (!existing) {
        const hashed = await bcrypt_1.default.hash('Propane1$', 10);
        const user = userRepo.create({
            firstName: 'NIYOKWIZERA',
            lastName: 'JEAN D AMOUR',
            email: 'niyokwizerajd123@gmail.com',
            password: hashed,
            gender: User_1.Gender.MALE,
            phone: '0784422138',
            role: User_1.UserRole.ADMIN,
            isActive: true,
        });
        await userRepo.save(user);
        console.log('Admin user seeded');
    }
    else {
        console.log('Admin user already exists');
    }
    await data_source_1.AppDataSource.destroy();
}
seed().catch(console.error);
