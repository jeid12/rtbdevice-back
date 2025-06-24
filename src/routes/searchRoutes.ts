import { Router } from 'express';
import searchController from '../controllers/searchController';
import { authorizeRoles } from '../middleware/authorizeRoles';
import { UserRole } from '../entity/User';

const router = Router();

// Device search
router.get('/devices', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL, UserRole.TECHNICIAN),
    searchController.searchDevices
);

// School search
router.get('/schools', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL),
    searchController.searchSchools
);

// User search
router.get('/users', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF),
    searchController.searchUsers
);

// Global search
router.get('/global', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL),
    searchController.globalSearch
);

// Quick search for header/dashboard
router.get('/quick', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL),
    searchController.quickSearch
);

// Autocomplete suggestions
router.get('/autocomplete', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL),
    searchController.getAutocompleteSuggestions
);

// Search filter options
router.get('/filters', 
    authorizeRoles(UserRole.ADMIN, UserRole.RTB_STAFF, UserRole.SCHOOL),
    searchController.getSearchFilters
);

export default router;
