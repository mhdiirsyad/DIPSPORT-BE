import { GraphQLError } from "graphql";
import { extractTokenFromHeader, verifyToken } from "./auth.js";
/**
 * Authentication middleware untuk GraphQL context
 * Extract dan verify JWT token dari Authorization header
 */
export function getAuthContext(authorization) {
    // Extract token dari header
    const token = extractTokenFromHeader(authorization);
    if (!token) {
        return { admin: null };
    }
    try {
        // Verify dan decode token
        const admin = verifyToken(token);
        return { admin };
    }
    catch (error) {
        // Token invalid atau expired, return null (tidak throw error)
        // Biarkan resolver yang menangani authorization
        return { admin: null };
    }
}
/**
 * Helper untuk memastikan user authenticated
 * Throw error jika tidak authenticated
 */
export function requireAuth(admin) {
    if (!admin) {
        throw new GraphQLError("Not authenticated", {
            extensions: { code: "UNAUTHENTICATED" },
        });
    }
    return admin;
}
