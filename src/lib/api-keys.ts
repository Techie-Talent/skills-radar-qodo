import { createHash, randomBytes } from 'crypto';
import { prisma } from './prisma';

export interface ApiKeyData {
  id: string;
  label: string;
  scopes: string[];
  createdAt: Date;
  lastUsedAt: Date | null;
  revoked: boolean;
  revokedAt: Date | null;
}

export interface CreateApiKeyRequest {
  label: string;
  scopes: string[];
  ownerId: string;
}

export interface CreateApiKeyResponse {
  apiKey: string; // The actual key to show to the user (only shown once)
  keyData: ApiKeyData;
}

/**
 * Generate a random API key
 */
export function generateApiKey(): string {
  return `sk_${randomBytes(32).toString('hex')}`;
}

/**
 * Hash an API key with salt
 */
export function hashApiKey(apiKey: string, salt: string): string {
  return createHash('sha256').update(apiKey + salt).digest('hex');
}

/**
 * Generate a random salt
 */
export function generateSalt(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Create a new API key
 */
export async function createApiKey({
  label,
  scopes,
  ownerId,
}: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
  const apiKey = generateApiKey();
  const salt = generateSalt();
  const keyHash = hashApiKey(apiKey, salt);

  const keyRecord = await prisma.apiKey.create({
    data: {
      label,
      keyHash,
      salt,
      ownerId,
      scopes,
    },
  });

  return {
    apiKey,
    keyData: {
      id: keyRecord.id,
      label: keyRecord.label,
      scopes: keyRecord.scopes,
      createdAt: keyRecord.createdAt,
      lastUsedAt: keyRecord.lastUsedAt,
      revoked: keyRecord.revoked,
      revokedAt: keyRecord.revokedAt,
    },
  };
}

/**
 * Verify an API key and return the associated data
 */
export async function verifyApiKey(apiKey: string): Promise<{
  valid: boolean;
  keyData?: ApiKeyData & { ownerId: string };
}> {
  if (!apiKey || !apiKey.startsWith('sk_')) {
    return { valid: false };
  }

  // Get all non-revoked API keys (we need to check against all since we don't know the salt)
  const apiKeys = await prisma.apiKey.findMany({
    where: {
      revoked: false,
    },
  });

  for (const keyRecord of apiKeys) {
    const hashedInput = hashApiKey(apiKey, keyRecord.salt);
    if (hashedInput === keyRecord.keyHash) {
      // Update last used timestamp
      await prisma.apiKey.update({
        where: { id: keyRecord.id },
        data: { lastUsedAt: new Date() },
      });

      return {
        valid: true,
        keyData: {
          id: keyRecord.id,
          label: keyRecord.label,
          scopes: keyRecord.scopes,
          createdAt: keyRecord.createdAt,
          lastUsedAt: new Date(),
          revoked: keyRecord.revoked,
          revokedAt: keyRecord.revokedAt,
          ownerId: keyRecord.ownerId,
        },
      };
    }
  }

  return { valid: false };
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(keyId: string): Promise<void> {
  await prisma.apiKey.update({
    where: { id: keyId },
    data: {
      revoked: true,
      revokedAt: new Date(),
    },
  });
}

/**
 * List API keys for a user
 */
export async function listApiKeys(ownerId: string): Promise<ApiKeyData[]> {
  const keys = await prisma.apiKey.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'desc' },
  });

  return keys.map((key) => ({
    id: key.id,
    label: key.label,
    scopes: key.scopes,
    createdAt: key.createdAt,
    lastUsedAt: key.lastUsedAt,
    revoked: key.revoked,
    revokedAt: key.revokedAt,
  }));
}

/**
 * Check if a key has the required scope
 */
export function hasScope(keyScopes: string[], requiredScope: string): boolean {
  return keyScopes.includes(requiredScope) || keyScopes.includes('*');
}

/**
 * Available scopes for API keys
 */
export const AVAILABLE_SCOPES = [
  'skills:read',
  'members:read',
  'dashboards:read',
  '*', // Full access
] as const;

export type ApiScope = typeof AVAILABLE_SCOPES[number];