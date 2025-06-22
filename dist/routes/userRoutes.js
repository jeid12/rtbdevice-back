"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
router.post('/register', userController_1.userController.register);
router.post('/login', userController_1.userController.login);
router.post('/verify-otp', userController_1.userController.verifyOtp);
exports.default = router;
