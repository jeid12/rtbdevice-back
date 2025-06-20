import { AppDataSource } from './data-source';
import { User, UserRole, Gender } from './entity/User';
import bcrypt from 'bcrypt';

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const existing = await userRepo.findOne({ where: { email: 'niyokwizerajd123@gmail.com' } });
  if (!existing) {
    const hashed = await bcrypt.hash('Propane1$', 10);
    const user = userRepo.create({
      firstName: 'NIYOKWIZERA',
      lastName: 'JEAN D AMOUR',
      email: 'niyokwizerajd123@gmail.com',
      password: hashed,
      gender: Gender.MALE,
      phone: '0784422138',
      role: UserRole.ADMIN,
      isActive: true,
    });
    await userRepo.save(user);
    console.log('Admin user seeded');
  } else {
    console.log('Admin user already exists');
  }
  await AppDataSource.destroy();
}

seed().catch(console.error);
