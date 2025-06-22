"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = void 0;
const blacklistedTokens = new Set();
exports.tokenService = {
    blacklistToken: (token) => {
        blacklistedTokens.add(token);
    },
    isTokenBlacklisted: (token) => {
        return blacklistedTokens.has(token);
    },
};
