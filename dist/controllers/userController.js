"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const userService_1 = require("../services/userService");
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
};
