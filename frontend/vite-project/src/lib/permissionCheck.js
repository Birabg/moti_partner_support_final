import { splitEffectivePermissions, getDefaultPermissionCodes } from "./permissions";

export function getUserEffectivePermissions(user) {
  const allCodes = Array.isArray(user?.permissions)
    ? [...new Set(user.permissions.map(c => String(c || "").trim().toUpperCase()).filter(Boolean))]
    : [];

  const role = user?.role;
  const managerType = user?.managerType;

  const defaultSet = new Set(getDefaultPermissionCodes(role, managerType));

  return {
    defaults: allCodes.filter(code => defaultSet.has(code)),
    extras: allCodes.filter(code => !defaultSet.has(code)),
    all: allCodes,
  };
}

export function hasPermission(user, permissionCode) {
  if (!user || !permissionCode) return false;
  
  const userPermissions = Array.isArray(user.permissions)
    ? user.permissions.map(c => String(c || "").trim().toUpperCase())
    : [];
  
  const code = String(permissionCode).trim().toUpperCase();
  
  return userPermissions.includes(code);
}

export function hasAnyPermission(user, permissionCodes) {
  if (!user || !Array.isArray(permissionCodes)) return false;
  
  const userPermissions = Array.isArray(user.permissions)
    ? new Set(user.permissions.map(c => String(c || "").trim().toUpperCase()))
    : new Set();
  
  return permissionCodes.some(code => userPermissions.has(String(code).trim().toUpperCase()));
}

export function hasAllPermissions(user, permissionCodes) {
  if (!user || !Array.isArray(permissionCodes)) return false;
  
  const userPermissions = Array.isArray(user.permissions)
    ? new Set(user.permissions.map(c => String(c || "").trim().toUpperCase()))
    : new Set();
  
  return permissionCodes.every(code => userPermissions.has(String(code).trim().toUpperCase()));
}

export function usePermissions(user) {
  return {
    hasPermission: (code) => hasPermission(user, code),
    hasAnyPermission: (codes) => hasAnyPermission(user, codes),
    hasAllPermissions: (codes) => hasAllPermissions(user, codes),
    ...getUserEffectivePermissions(user),
  };
}