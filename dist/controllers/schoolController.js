"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schoolController = void 0;
const schoolService_1 = require("../services/schoolService");
exports.schoolController = {
    create: async (req, res) => {
        try {
            const school = await schoolService_1.schoolService.create(req.body);
            res.status(201).json(school);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    getAll: async (_req, res) => {
        try {
            const schools = await schoolService_1.schoolService.getAll();
            res.status(200).json(schools);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    getById: async (req, res) => {
        try {
            const school = await schoolService_1.schoolService.getById(Number(req.params.id));
            res.status(200).json(school);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const school = await schoolService_1.schoolService.update(Number(req.params.id), req.body);
            res.status(200).json(school);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    delete: async (req, res) => {
        try {
            const result = await schoolService_1.schoolService.delete(Number(req.params.id));
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
};
