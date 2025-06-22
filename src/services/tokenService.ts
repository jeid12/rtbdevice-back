const blacklistedTokens = new Set<string>();

export const tokenService = {
  blacklistToken: (token: string) => {
    blacklistedTokens.add(token);
  },
  isTokenBlacklisted: (token: string) => {
    return blacklistedTokens.has(token);
  },
};
