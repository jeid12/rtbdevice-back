import { AppDataSource } from '../data-source';
import { School } from '../entity/School';
import { User, UserRole } from '../entity/User';

export const schoolService = {
  create: async (data: any) => {
    const userRepo = AppDataSource.getRepository(User);
    const schoolRepo = AppDataSource.getRepository(School);
    const user = await userRepo.findOne({ where: { id: data.userId } });
    if (!user) throw new Error('User not found');
    if (user.role !== UserRole.SCHOOL) throw new Error('User must have role "school" to be related to a school');
    const school = schoolRepo.create({ ...data, user });
    return await schoolRepo.save(school);
  },

  getAll: async () => {
    const schoolRepo = AppDataSource.getRepository(School);
    return schoolRepo.find({ relations: ['user'] });
  },

  getById: async (id: number) => {
    const schoolRepo = AppDataSource.getRepository(School);
    const school = await schoolRepo.findOne({ where: { id }, relations: ['user'] });
    if (!school) throw new Error('School not found');
    return school;
  },

  update: async (id: number, data: any) => {
    const schoolRepo = AppDataSource.getRepository(School);
    const userRepo = AppDataSource.getRepository(User);
    const school = await schoolRepo.findOne({ where: { id }, relations: ['user'] });
    if (!school) throw new Error('School not found');
    if (data.userId) {
      const user = await userRepo.findOne({ where: { id: data.userId } });
      if (!user) throw new Error('User not found');
      if (user.role !== UserRole.SCHOOL) throw new Error('User must have role "school" to be related to a school');
      school.user = user;
    }
    Object.assign(school, data);
    return await schoolRepo.save(school);
  },

  delete: async (id: number) => {
    const schoolRepo = AppDataSource.getRepository(School);
    const school = await schoolRepo.findOne({ where: { id } });
    if (!school) throw new Error('School not found');
    await schoolRepo.remove(school);
    return { message: 'School deleted.' };
  },
};
