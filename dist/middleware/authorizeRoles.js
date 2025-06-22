"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = authorizeRoles;
const authenticateJWT_1 = require("./authenticateJWT");
const User_1 = require("../entity/User");
function authorizeRoles(...roles) {
    return (req, res, next) => {
        (0, authenticateJWT_1.authenticateJWT)(req, res, (err) => {
            if (err)
                return next(err);
            const user = req.user;
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (user.role === User_1.UserRole.ADMIN) {
                return next();
            }
            if (!roles.includes(user.role)) {
                return res.status(403).json({ error: 'Forbidden: insufficient privileges' });
            }
            next();
        });
    };
}
