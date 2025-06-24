"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolService = void 0;
const data_source_1 = require("../data-source");
const School_1 = require("../entity/School");
const User_1 = require("../entity/User");
exports.schoolService = {
    create: async (data) => {
        const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
        const schoolRepo = data_source_1.AppDataSource.getRepository(School_1.School);
        const user = await userRepo.findOne({ where: { id: data.userId } });
        if (!user)
            throw new Error('User not found');
        if (user.role !== User_1.UserRole.SCHOOL)
            throw new Error('User must have role "school" to be related to a school');
        const school = schoolRepo.create({ ...data, user });
        return await schoolRepo.save(school);
    },
    getAll: async () => {
        const schoolRepo = data_source_1.AppDataSource.getRepository(School_1.School);
        return schoolRepo.find({ relations: ['user'] });
    },
    getById: async (id) => {
        const schoolRepo = data_source_1.AppDataSource.getRepository(School_1.School);
        const school = await schoolRepo.findOne({ where: { id }, relations: ['user'] });
        if (!school)
            throw new Error('School not found');
        return school;
    },
    update: async (id, data) => {
        const schoolRepo = data_source_1.AppDataSource.getRepository(School_1.School);
        const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
        const school = await schoolRepo.findOne({ where: { id }, relations: ['user'] });
        if (!school)
            throw new Error('School not found');
        if (data.userId) {
            const user = await userRepo.findOne({ where: { id: data.userId } });
            if (!user)
                throw new Error('User not found');
            if (user.role !== User_1.UserRole.SCHOOL)
                throw new Error('User must have role "school" to be related to a school');
            school.user = user;
        }
        Object.assign(school, data);
        return await schoolRepo.save(school);
    },
    delete: async (id) => {
        const schoolRepo = data_source_1.AppDataSource.getRepository(School_1.School);
        const school = await schoolRepo.findOne({ where: { id } });
        if (!school)
            throw new Error('School not found');
        await schoolRepo.remove(school);
        return { message: 'School deleted.' };
    },
};
