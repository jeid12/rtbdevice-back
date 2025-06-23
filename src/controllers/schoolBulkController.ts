
import { schoolService } from '../services/schoolService';
import xlsx from 'xlsx';
import { User, UserRole } from '../entity/User';
import { AppDataSource } from '../data-source';

export const schoolBulkController = {
  bulkUpload: async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet);
      const userRepo = AppDataSource.getRepository(User);
      const results = [];
      for (const row of rows as any[]) {
        try {
          const user = await userRepo.findOne({ where: { email: row.userEmail } });
          if (!user) throw new Error('User not found: ' + row.userEmail);
          if (user.role !== UserRole.SCHOOL) throw new Error('User is not a school: ' + row.userEmail);
          await schoolService.create({ ...row, userId: user.id });
          results.push({ row, status: 'success' });
        } catch (err: any) {
          results.push({ row, status: 'error', error: err.message });
        }
      }
      return res.json({ results });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
};
