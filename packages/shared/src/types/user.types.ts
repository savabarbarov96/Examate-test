/**
 * Shared User types for Examate microservices
 * These are DTOs/interfaces for inter-service communication
 * Each service may have its own Mongoose model with additional fields
 */

export type UserStatus = 'unverified' | 'active' | 'suspended' | 'deleted';

export type RoleScope = 'system' | 'client';

/**
 * Base user interface for API responses
 * Does not include sensitive fields like password, tokens, etc.
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  client: string;
  phone?: string;
  dob?: Date | string;
  profilePic?: string;
  status: UserStatus;
  accountLocked: boolean;
  twoFactorEnabled: boolean;
  firstLogin: boolean;
  role: Role | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * User creation DTO
 */
export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  client: string;
  password: string;
  passwordConfirm: string;
  phone?: string;
  dob?: Date | string;
  roleId: string;
}

/**
 * User update DTO
 */
export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dob?: Date | string;
  profilePic?: string;
  status?: UserStatus;
  roleId?: string;
}

/**
 * Role interface
 */
export interface Role {
  id: string;
  name: string;
  system: boolean;
  scope: RoleScope;
  permissions: Record<string, string[]>;
  restrictions?: {
    cannotManageSysAdmin?: boolean;
    restrictedModules?: string[];
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * JWT Payload interface
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  client: string;
  iat?: number;
  exp?: number;
}

/**
 * Session information
 */
export interface Session {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
  };
  location?: {
    country?: string;
    city?: string;
  };
  isActive: boolean;
  lastActivity: Date | string;
  createdAt: Date | string;
}
