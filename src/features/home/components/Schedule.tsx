import { Navbar } from '@/components/common';
import {
    ListItem,
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { PermissionProvider } from '@/utils';
import { Link, Outlet } from 'react-router-dom';

export const Schedule = () => {
    const P = PermissionProvider();
    return (
        <>
            <div className="nav-bs dark:border-b">
                <Navbar />
                <div className="pl-4 pr-[70px] relative z-10 pt-1 pb-4 flex justify-between flex-row">
                    <NavigationMenu>
                        <NavigationMenuList>
                            {P?.IS_ADMIN_OR_HR && (
                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        asChild
                                        className={navigationMenuTriggerStyle()}
                                    >
                                        <Link to="./schedule-list">Danh sách đăng kí lịch</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            )}
                            {!P?.IS_ADMIN && (
                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        asChild
                                        className={navigationMenuTriggerStyle()}
                                    >
                                        <Link to="./schedule-reg">Đăng kí lịch</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            )}
                            {P?.IS_ADMIN && (
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>Quản lý</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                                            <Link to="./work-shifts">
                                                <ListItem title="Quản lý ca làm việc">
                                                    Thêm sửa xóa ca làm việc trong công ty.
                                                </ListItem>
                                            </Link>
                                            <Link to="./config-schedules">
                                                <ListItem title="Cấu hình lịch">
                                                    Thêm sửa xóa lịch trong công ty.
                                                </ListItem>
                                            </Link>
                                        </ul>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            )}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </div>
            <div className="px-5 py-3 flex-1 relative">
                <Outlet />
            </div>
        </>
    );
};
