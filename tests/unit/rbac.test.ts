import { describe, it, expect } from 'vitest';
import { can, roleAtLeast, assertCan, AuthorizationError } from '@/lib/rbac';

describe('rbac', () => {
  it('orders roles by privilege', () => {
    expect(roleAtLeast('ADMIN', 'EDITOR')).toBe(true);
    expect(roleAtLeast('EDITOR', 'ADMIN')).toBe(false);
    expect(roleAtLeast('USER', 'USER')).toBe(true);
    expect(roleAtLeast(undefined, 'USER')).toBe(false);
  });

  it('grants content:review to editors and admins only', () => {
    expect(can('EDITOR', 'content:review')).toBe(true);
    expect(can('ADMIN', 'content:review')).toBe(true);
    expect(can('RESEARCHER', 'content:review')).toBe(false);
    expect(can('USER', 'content:review')).toBe(false);
    expect(can('VISITOR', 'content:review')).toBe(false);
  });

  it('reserves user:manage and audit:read for admins', () => {
    expect(can('ADMIN', 'user:manage')).toBe(true);
    expect(can('EDITOR', 'user:manage')).toBe(false);
    expect(can('ADMIN', 'audit:read')).toBe(true);
    expect(can('EDITOR', 'audit:read')).toBe(false);
  });

  it('lets researchers submit content but not visitors', () => {
    expect(can('RESEARCHER', 'content:submit')).toBe(true);
    expect(can('USER', 'content:submit')).toBe(false);
  });

  it('assertCan throws AuthorizationError when denied', () => {
    expect(() => assertCan('USER', 'user:manage')).toThrow(AuthorizationError);
    expect(() => assertCan('ADMIN', 'user:manage')).not.toThrow();
  });
});
