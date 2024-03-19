import { useInfoUser } from "@/hooks"
import { InforUser } from "@/models";
class Permission {
    user: InforUser;
    constructor(user:InforUser) {
        this.user = user;
    }

    get IS_ADMIN_OR_HR() {
        return this.user?.RoleName === "Admin" || this.user?.RoleName === "Hr";
    }
    get IS_ADMIN_OR_HR_MANAGER() {
        return this.user?.RoleName === "Admin" || this.user?.RoleName === "Hr"|| this.user?.RoleName === "Manager";
    }
    get IS_ADMIN() {
        return this.user?.RoleName === "Admin";
    }

    get IS_HR() {
        return this.user?.RoleName === "Hr";
    }

    get IS_HR_MANAGER() {
        return this.user?.RoleName === "Hr" || this.user?.RoleName === "Manager";
    }
}

// Sử dụng hook trong functional component
export const PermissionProvider = () => {
    const user = useInfoUser();
    if(user){
        return new Permission(user);
    }
    return null;
}