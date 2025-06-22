"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authorizeRoles_1 = require("../middleware/authorizeRoles");
const User_1 = require("../entity/User");
const router = (0, express_1.Router)();
// Protect user management routes
router.get('/', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), userController_1.userController.getAll);
router.get('/:id', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), userController_1.userController.getById);
router.put('/:id', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), userController_1.userController.update);
router.delete('/:id', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN), userController_1.userController.delete);
router.patch('/:id/activate', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), userController_1.userController.setActive);
// Only admin and RTB-staff can add users (register)
router.post('/register', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), userController_1.userController.register);
router.post('/login', userController_1.userController.login);
router.post('/verify-otp', userController_1.userController.verifyOtp);
router.post('/logout', userController_1.userController.logout);
router.post('/forgot-password', userController_1.userController.forgotPassword);
router.post('/verify-reset-otp', userController_1.userController.verifyResetOtp);
router.post('/reset-password', userController_1.userController.resetPassword);
exports.default = router;
