"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const searchController_1 = __importDefault(require("../controllers/searchController"));
const authorizeRoles_1 = require("../middleware/authorizeRoles");
const User_1 = require("../entity/User");
const router = (0, express_1.Router)();
// Device search
router.get('/devices', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF, User_1.UserRole.SCHOOL, User_1.UserRole.TECHNICIAN), searchController_1.default.searchDevices);
// School search
router.get('/schools', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF, User_1.UserRole.SCHOOL), searchController_1.default.searchSchools);
// User search
router.get('/users', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF), searchController_1.default.searchUsers);
// Global search
router.get('/global', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF, User_1.UserRole.SCHOOL), searchController_1.default.globalSearch);
// Quick search for header/dashboard
router.get('/quick', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF, User_1.UserRole.SCHOOL), searchController_1.default.quickSearch);
// Autocomplete suggestions
router.get('/autocomplete', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF, User_1.UserRole.SCHOOL), searchController_1.default.getAutocompleteSuggestions);
// Search filter options
router.get('/filters', (0, authorizeRoles_1.authorizeRoles)(User_1.UserRole.ADMIN, User_1.UserRole.RTB_STAFF, User_1.UserRole.SCHOOL), searchController_1.default.getSearchFilters);
exports.default = router;
