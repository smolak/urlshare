export const getAuthToken = (bearerTokenString: string) => bearerTokenString.split("Bearer ")[1];
