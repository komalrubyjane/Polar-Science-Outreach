import bcrypt from 'bcryptjs';
import { z } from 'zod';

const ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/**
 * Password policy: at least 8 chars, with lower, upper and a digit.
 * Kept deliberately modest so it does not frustrate legitimate users, while
 * still blocking the most trivial passwords.
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(200, 'Password is too long')
  .refine((v) => /[a-z]/.test(v), 'Include a lowercase letter')
  .refine((v) => /[A-Z]/.test(v), 'Include an uppercase letter')
  .refine((v) => /[0-9]/.test(v), 'Include a number');
