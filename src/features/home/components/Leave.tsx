import { Navbar } from '@/components/common';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { useInfoUser } from '@/hooks';
import { Link, Outlet } from 'react-router-dom';


export const Leave = () => {
    const user = useInfoUser();
    return (
        <>
            <div className="nav-bs dark:border-b">
                <Navbar />
                <div className="pl-4 pr-[70px] relative z-10 pt-1 pb-4 flex justify-between flex-row">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    asChild
                                    className={navigationMenuTriggerStyle()}
                                >
                                    <Link to="./time-leave-list">Danh sách đơn xin nghỉ</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            {user?.RoleName === 'Admin' && (
                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        asChild
                                        className={navigationMenuTriggerStyle()}
                                    >
                                        <Link to="./leave-type">Loại đơn</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            )}
                            {/* <NavigationMenuItem>
                                <NavigationMenuTrigger>Quản lý</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                                        <Link to="./leave-type">
                                            <ListItem title="Quản lý loại đơn nghỉ phép">
                                                Thêm sửa xóa loại đơn nghỉ phép trong công ty.
                                            </ListItem>
                                        </Link>
                                        <Link to="./leave-me">
                                            <ListItem title="Ngày nghỉ của tôi">
                                                Ngày nghỉ còn lại của người dùng
                                            </ListItem>
                                        </Link>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem> */}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </div>
            <div className="p-5 flex-1 overflow-hidden">
                <Outlet />
            </div>
        </>
    );
};
