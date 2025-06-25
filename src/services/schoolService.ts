import { AppDataSource } from '../data-source';
import { School } from '../entity/School';
import { User, UserRole } from '../entity/User';
import { Repository } from 'typeorm';

export class SchoolService {
  private schoolRepository: Repository<School>;
  private userRepository: Repository<User>;

  constructor() {
    this.schoolRepository = AppDataSource.getRepository(School);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Validate that a user can be assigned to a school
   */
  private async validateUserForSchoolAssignment(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      relations: ['assignedSchool']
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.role !== UserRole.SCHOOL) {
      throw new Error('Only users with role "school" can be assigned to manage a school');
    }
    
    if (user.assignedSchool) {
      throw new Error('User is already assigned to manage another school');
    }
    
    return user;
  }

  /**
   * Create a new school with user assignment
   */
  async createSchool(schoolData: {
    name: string;
    code: string;
    province: string;
    district: string;
    sector: string;
    cell?: string;
    village?: string;
    type?: string;
    status?: string;
    studentCount?: number;
    teacherCount?: number;
    userId?: number;
  }): Promise<School> {
    let user: User | undefined;
    
    // Validate user if provided
    if (schoolData.userId) {
      user = await this.validateUserForSchoolAssignment(schoolData.userId);
    }

    const school = this.schoolRepository.create({
      name: schoolData.name,
      code: schoolData.code,
      province: schoolData.province,
      district: schoolData.district,
      sector: schoolData.sector,
      cell: schoolData.cell,
      village: schoolData.village,
      type: schoolData.type as any,
      status: schoolData.status as any,
      studentCount: schoolData.studentCount,
      teacherCount: schoolData.teacherCount,
      user: user
    });

    return await this.schoolRepository.save(school);
  }

  /**
   * Get all schools with their assigned users
   */
  async getAllSchools(): Promise<School[]> {
    return await this.schoolRepository.find({ 
      relations: ['user', 'devices'] 
    });
  }

  /**
   * Get school by ID
   */
  async getSchoolById(id: number): Promise<School | null> {
    return await this.schoolRepository.findOne({ 
      where: { id }, 
      relations: ['user', 'devices'] 
    });
  }

  /**
   * Update school
   */
  async updateSchool(id: number, updateData: {
    name?: string;
    code?: string;
    province?: string;
    district?: string;
    sector?: string;
    cell?: string;
    village?: string;
    type?: string;
    status?: string;
    studentCount?: number;
    teacherCount?: number;
    userId?: number;
  }): Promise<School | null> {
    const school = await this.getSchoolById(id);
    if (!school) {
      return null;
    }

    // Handle user assignment change
    if (updateData.userId !== undefined) {
      if (updateData.userId === null) {
        // Remove user assignment
        school.user = undefined;
      } else {
        // Validate and assign new user
        const user = await this.validateUserForSchoolAssignment(updateData.userId);
        school.user = user;
      }
    }

    // Update other fields
    const { userId, ...otherData } = updateData;
    Object.assign(school, otherData);

    return await this.schoolRepository.save(school);
  }

  /**
   * Assign a user to manage a school
   */
  async assignUserToSchool(schoolId: number, userId: number): Promise<School | null> {
    const school = await this.getSchoolById(schoolId);
    if (!school) {
      throw new Error('School not found');
    }

    if (school.user) {
      throw new Error('School already has an assigned user');
    }

    const user = await this.validateUserForSchoolAssignment(userId);
    school.user = user;

    return await this.schoolRepository.save(school);
  }

  /**
   * Remove user assignment from school
   */
  async unassignUserFromSchool(schoolId: number): Promise<School | null> {
    const school = await this.getSchoolById(schoolId);
    if (!school) {
      throw new Error('School not found');
    }

    school.user = undefined;
    return await this.schoolRepository.save(school);
  }

  /**
   * Delete school
   */
  async deleteSchool(id: number): Promise<boolean> {
    const result = await this.schoolRepository.delete(id);
    return result.affected !== 0;
  }

  /**
   * Get schools without assigned users
   */
  async getSchoolsWithoutUsers(): Promise<School[]> {
    return await this.schoolRepository
      .createQueryBuilder('school')
      .leftJoinAndSelect('school.user', 'user')
      .where('school.user IS NULL')
      .getMany();
  }

  /**
   * Get available users for school assignment (users with role 'school' not assigned to any school)
   */
  async getAvailableUsersForSchoolAssignment(): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.assignedSchool', 'assignedSchool')
      .where('user.role = :role', { role: UserRole.SCHOOL })
      .andWhere('assignedSchool.id IS NULL')
      .getMany();
  }
}

// For backward compatibility, export both class and object
export const schoolService = {
  create: async (data: any) => {
    const service = new SchoolService();
    return await service.createSchool(data);
  },

  getAll: async () => {
    const service = new SchoolService();
    return await service.getAllSchools();
  },

  getById: async (id: number) => {
    const service = new SchoolService();
    return await service.getSchoolById(id);
  },

  update: async (id: number, data: any) => {
    const service = new SchoolService();
    return await service.updateSchool(id, data);
  },

  delete: async (id: number) => {
    const service = new SchoolService();
    const result = await service.deleteSchool(id);
    return result ? { message: 'School deleted.' } : { message: 'School not found.' };
  },
};
