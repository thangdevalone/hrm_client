import { Navbar } from '@/components/common';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { PermissionProvider } from '@/utils';

import { Link, Outlet } from 'react-router-dom';

export const TimeKeep = () => {
    const P=PermissionProvider()

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
                                        <Link to="./timekeep-list">Danh sách chấm công</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            )}
                            {P?.IS_ADMIN_OR_HR && (
                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        asChild
                                        className={navigationMenuTriggerStyle()}
                                    >
                                        <Link to="./timekeep-absent">Danh sách nghỉ không phép</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            )}
                            {!P?.IS_ADMIN  && (
                                <NavigationMenuItem>
                                    <NavigationMenuLink
                                        asChild
                                        className={navigationMenuTriggerStyle()}
                                    >
                                        <Link to="./timekeep-reg">Chấm công</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            )}
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
