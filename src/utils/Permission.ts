import { useInfoUser } from '@/hooks';
import { InfoUser, ROLE_DEF } from '@/models';

class Permission {
    user: InfoUser;

    constructor(user: InfoUser) {
        this.user = user;
    }

    get IS_ADMIN_OR_HR() {
        return this.user?.role.roleName === ROLE_DEF.ADMIN || this.user?.role.roleName === ROLE_DEF.HR;
    }

    get IS_ADMIN() {
        return this.user?.role.roleName === ROLE_DEF.ADMIN;
    }

    get IS_HR() {
        return this.user?.role.roleName === ROLE_DEF.HR;
    }

}

// Sử dụng hook trong functional component
export const PermissionProvider = () => {
    const user = useInfoUser();
    if (user) {
        return new Permission(user);
    }
    return null;
};
