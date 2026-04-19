import { usePage } from '@inertiajs/react';

export function usePermissions() {
    const { user_permissions } = usePage().props;

    const permissions = Array.isArray(user_permissions) ? user_permissions : [];

    const can = (permission) => {
        if (!permission) return false;
        return permissions.includes(permission);
    };

    const canAny = (perms = []) => {
        if (!Array.isArray(perms) || perms.length === 0) return false;
        return perms.some((p) => permissions.includes(p));
    };

    const canAll = (perms = []) => {
        if (!Array.isArray(perms) || perms.length === 0) return false;
        return perms.every((p) => permissions.includes(p));
    };

    return {
        permissions,
        can,
        canAny,
        canAll,
    };
}
