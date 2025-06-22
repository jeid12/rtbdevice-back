"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const userService_1 = require("../services/userService");
const tokenService_1 = require("../services/tokenService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.userController = {
    register: async (req, res) => {
        try {
            const user = await userService_1.userService.register(req.body);
            res.status(201).json(user);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    login: async (req, res) => {
        try {
            const result = await userService_1.userService.login(req.body);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    },
    verifyOtp: async (req, res) => {
        try {
            const result = await userService_1.userService.verifyOtp(req.body);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(401).json({ error: error.message });
        }
    },
    logout: async (req, res) => {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(400).json({ error: 'No token provided.' });
        }
        try {
            jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            tokenService_1.tokenService.blacklistToken(token);
            res.status(200).json({ message: 'Logged out successfully.' });
        }
        catch (err) {
            res.status(401).json({ error: 'Invalid token.' });
        }
    },
    forgotPassword: async (req, res) => {
        try {
            const result = await userService_1.userService.forgotPassword(req.body);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    verifyResetOtp: async (req, res) => {
        try {
            const result = await userService_1.userService.verifyResetOtp(req.body);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    resetPassword: async (req, res) => {
        try {
            const result = await userService_1.userService.resetPassword(req.body);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    getAll: async (_req, res) => {
        try {
            const users = await userService_1.userService.getAll();
            res.status(200).json(users);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    getById: async (req, res) => {
        try {
            const user = await userService_1.userService.getById(Number(req.params.id));
            res.status(200).json(user);
        }
        catch (error) {
            res.status(404).json({ error: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const user = await userService_1.userService.update(Number(req.params.id), req.body);
            res.status(200).json(user);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    delete: async (req, res) => {
        try {
            const result = await userService_1.userService.delete(Number(req.params.id));
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    setActive: async (req, res) => {
        try {
            const user = await userService_1.userService.setActive(Number(req.params.id), req.body.isActive);
            res.status(200).json(user);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
};
