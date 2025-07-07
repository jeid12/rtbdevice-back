import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { User, UserRole, UserStatus, Gender } from './entity/User';
import { School, SchoolType, SchoolStatus } from './entity/School';
import { Device, DeviceCategory, DeviceStatus, DeviceCondition } from './entity/Device';
import bcrypt from 'bcrypt';

async function seedDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection initialized');

    // Create repositories
    const userRepository = AppDataSource.getRepository(User);
    const schoolRepository = AppDataSource.getRepository(School);
    const deviceRepository = AppDataSource.getRepository(Device);

    // Check if admin user already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@rtb.rw' }
    });

    if (!existingAdmin) {
      // Create default admin user
      const adminUser = new User();
      adminUser.firstName = 'System';
      adminUser.lastName = 'Administrator';
      adminUser.email = 'admin@rtb.rw';
      adminUser.phone = '+250788000000';
      adminUser.password = await bcrypt.hash('admin123', 10);
      adminUser.role = UserRole.ADMIN;
      adminUser.status = UserStatus.ACTIVE;
      adminUser.gender = Gender.MALE;

      await userRepository.save(adminUser);
      console.log('Admin user created: admin@rtb.rw / admin123');
    } else {
      console.log('Admin user already exists');
    }

    // Create sample schools if none exist
    const schoolCount = await schoolRepository.count();
    if (schoolCount === 0) {
      const sampleSchools = [
        {
          name: 'IPRC Kigali',
          code: 'IPRC-KGL',
          type: SchoolType.TVET,
          address: 'Kigali, Rwanda',
          phone: '+250788123456',
          email: 'info@iprckigali.rw',
          principalName: 'Dr. Jean Uwimana',
          principalPhone: '+250788123457',
          principalEmail: 'principal@iprckigali.rw',
          district: 'Kigali',
          sector: 'Nyarugenge',
          status: SchoolStatus.ACTIVE
        },
        {
          name: 'IPRC Huye',
          code: 'IPRC-HUY',
          type: SchoolType.TVET,
          address: 'Huye, Rwanda',
          phone: '+250788123458',
          email: 'info@iprchuye.rw',
          principalName: 'Prof. Marie Mukamana',
          principalPhone: '+250788123459',
          principalEmail: 'principal@iprchuye.rw',
          district: 'Huye',
          sector: 'Tumba',
          status: SchoolStatus.ACTIVE
        },
        {
          name: 'IPRC Musanze',
          code: 'IPRC-MSZ',
          type: SchoolType.TVET,
          address: 'Musanze, Rwanda',
          phone: '+250788123460',
          email: 'info@iprcmusanze.rw',
          principalName: 'Dr. Paul Kagame',
          principalPhone: '+250788123461',
          principalEmail: 'principal@iprcmusanze.rw',
          district: 'Musanze',
          sector: 'Muhoza',
          status: SchoolStatus.ACTIVE
        }
      ];

      for (const schoolData of sampleSchools) {
        const school = schoolRepository.create(schoolData);
        await schoolRepository.save(school);
      }
      console.log('Sample schools created');
    } else {
      console.log('Schools already exist');
    }

    // Create sample devices if none exist
    const deviceCount = await deviceRepository.count();
    if (deviceCount === 0) {
      const schools = await schoolRepository.find();
      const sampleDevices = [
        {
          serialNumber: 'RTB-001',
          name_tag: 'MacBook Pro 14',
          model: 'MacBook Pro',
          brand: 'Apple',
          category: DeviceCategory.LAPTOP,
          status: DeviceStatus.ACTIVE,
          condition: DeviceCondition.EXCELLENT,
          purchaseDate: '2023-01-15',
          purchaseCost: 2500000,
          warrantyExpiry: '2026-01-15',
          schoolId: schools[0]?.id,
          location: 'Computer Lab 1',
          notes: 'Primary development machine'
        },
        {
          serialNumber: 'RTB-002',
          name_tag: 'Dell Latitude 5520',
          model: 'Latitude 5520',
          brand: 'Dell',
          category: DeviceCategory.LAPTOP,
          status: DeviceStatus.MAINTENANCE,
          condition: DeviceCondition.GOOD,
          purchaseDate: '2022-06-20',
          purchaseCost: 1800000,
          warrantyExpiry: '2025-06-20',
          schoolId: schools[1]?.id,
          location: 'Computer Lab 2',
          notes: 'Requires keyboard replacement'
        },
        {
          serialNumber: 'RTB-003',
          name_tag: 'HP EliteBook 840',
          model: 'EliteBook 840',
          brand: 'HP',
          category: DeviceCategory.LAPTOP,
          status: DeviceStatus.ACTIVE,
          condition: DeviceCondition.EXCELLENT,
          purchaseDate: '2023-03-10',
          purchaseCost: 2200000,
          warrantyExpiry: '2026-03-10',
          schoolId: schools[2]?.id,
          location: 'Admin Office',
          notes: 'Administrative use'
        }
      ];

      for (const deviceData of sampleDevices) {
        const device = deviceRepository.create(deviceData);
        await deviceRepository.save(device);
      }
      console.log('Sample devices created');
    } else {
      console.log('Devices already exist');
    }

    console.log('Database seeding completed successfully!');
    console.log('\nDefault Login Credentials:');
    console.log('Email: admin@rtb.rw');
    console.log('Password: admin123');
    console.log('\nYou can now start the application and login with these credentials.');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seedDatabase();
