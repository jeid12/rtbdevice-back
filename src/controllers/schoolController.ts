import { Request, Response } from 'express';
import { schoolService, SchoolService } from '../services/schoolService';
import { PaginationQuery } from '../interfaces/pagination';

const schoolServiceInstance = new SchoolService();

export const schoolController = {
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const school = await schoolServiceInstance.createSchool(req.body);
      res.status(201).json({
        success: true,
        message: 'School created successfully',
        data: school
      });
    } catch (error: any) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      // Parse pagination parameters
      const paginationQuery: PaginationQuery = {
        page: req.query.page as string,
        limit: req.query.limit as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC'
      };

      const paginationOptions = {
        page: paginationQuery.page ? parseInt(paginationQuery.page) : undefined,
        limit: paginationQuery.limit ? parseInt(paginationQuery.limit) : undefined,
        sortBy: paginationQuery.sortBy,
        sortOrder: (paginationQuery.sortOrder as 'ASC' | 'DESC') || undefined
      };

      const result = await schoolServiceInstance.getAllSchools(paginationOptions);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    try {
      const school = await schoolServiceInstance.getSchoolById(Number(req.params.id));
      if (!school) {
        res.status(404).json({
          success: false,
          error: 'School not found'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: school
      });
    } catch (error: any) {
      res.status(404).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const school = await schoolServiceInstance.updateSchool(Number(req.params.id), req.body);
      if (!school) {
        res.status(404).json({
          success: false,
          error: 'School not found'
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'School updated successfully',
        data: school
      });
    } catch (error: any) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await schoolServiceInstance.deleteSchool(Number(req.params.id));
      if (!result) {
        res.status(404).json({
          success: false,
          error: 'School not found'
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'School deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // New endpoints for user assignment
  assignUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const { userId } = req.body;
      
      const school = await schoolServiceInstance.assignUserToSchool(Number(schoolId), userId);
      res.status(200).json({
        success: true,
        message: 'User assigned to school successfully',
        data: school
      });
    } catch (error: any) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  unassignUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const { schoolId } = req.params;
      
      const school = await schoolServiceInstance.unassignUserFromSchool(Number(schoolId));
      res.status(200).json({
        success: true,
        message: 'User unassigned from school successfully',
        data: school
      });
    } catch (error: any) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  getSchoolsWithoutUsers: async (_req: Request, res: Response): Promise<void> => {
    try {
      const schools = await schoolServiceInstance.getSchoolsWithoutUsers();
      res.status(200).json({
        success: true,
        data: schools,
        total: schools.length
      });
    } catch (error: any) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  getAvailableUsers: async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await schoolServiceInstance.getAvailableUsersForSchoolAssignment();
      res.status(200).json({
        success: true,
        data: users,
        total: users.length
      });
    } catch (error: any) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  },
};
