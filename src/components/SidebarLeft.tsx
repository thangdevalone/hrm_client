import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { PermissionProvider } from '@/utils';
import { TextAlignJustifyIcon } from '@radix-ui/react-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icons } from './icons';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Lock, LogOut, Settings, UserRound } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';
import { authActions } from '@/features/auth/AuthSlice';
import { useState } from 'react';
import { useInfoUser } from '@/hooks';
import { useDispatch } from 'react-redux';

interface SidebarProps {
    collapse: boolean;
    className: string;
    setCollapse: (newCollapse: boolean) => void;
}

function shorten(username: string): string {
    const parts = username.trim().split(' ');

    if (parts.length <= 2) {
        return parts[0] + (parts[1] ? ' ' + parts[1] : '');
    }

    return parts.slice(0, -1).map(part => part[0] + '.').join('').slice(0, -1) + ' ' + parts.pop();
}

export const SidebarLeft = ({ className, collapse, setCollapse }: SidebarProps) => {
    const navitage = useNavigate();
    const theme = useTheme();
    const location = useLocation();
    const handleNavitage = (router: string) => {
        console.log(router)
        if (location.pathname.includes(router)) return;
        navitage(`/home/${router}`);
    };
    const P = PermissionProvider();
    const user = useInfoUser();
    const dispatch = useDispatch();
    const [openAlertLogout, setOpenAlertLogout] = useState(false);
    const handleLogout = () => {
        dispatch(authActions.logout());
    };
    return (
        <div className={cn('pb-5 dark:border-r side-bs', className)}>
            <div className="flex flex-col h-full justify-between">
                <div className="space-y-4 py-4 ">
                    <div className="mb-4 px-5 gap-3 flex-row flex items-center">
                        <Button size="icon" onClick={() => setCollapse(!collapse)}>
                            <TextAlignJustifyIcon />
                        </Button>
                    </div>
                    <div className="px-3 py-2">
                        <div className="space-y-2">
                            <Button
                                onClick={() => handleNavitage('overview')}
                                variant={
                                    location.pathname.includes('overview') ? 'secondary' : 'ghost'
                                }
                                className="w-full gap-3 justify-start h-10"
                            >
                                <Icons.overview
                                    className="w-5 h-5"
                                    color={theme.theme === 'dark' ? '#ffffff' : ''}
                                />
                                {!collapse && 'Tổng quan'}
                            </Button>
                            {P?.IS_ADMIN && (
                                <Button
                                    onClick={() => handleNavitage('admin')}
                                    variant={
                                        location.pathname.includes('admin') ? 'secondary' : 'ghost'
                                    }
                                    className="w-full gap-3 justify-start h-10"
                                >
                                    <Icons.dashboard
                                        className="w-5 h-5"
                                        color={theme.theme === 'dark' ? '#ffffff' : ''}
                                    />
                                    {!collapse && 'Trang quản trị'}
                                </Button>
                            )}
                            {P?.IS_ADMIN_OR_HR && (
                                <Button
                                    onClick={() => handleNavitage('info-employee')}
                                    variant={
                                        location.pathname.includes('info-employee')
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    className="w-full gap-3 justify-start h-10"
                                >
                                    <Icons.group
                                        className="w-5 h-5"
                                        color={theme.theme === 'dark' ? '#ffffff' : 'black'}
                                    />
                                    {!collapse && 'Nhân viên'}
                                </Button>
                            )}
                            <Button
                                onClick={() => handleNavitage('time-keep')}
                                variant={
                                    location.pathname.includes('time-keep') ? 'secondary' : 'ghost'
                                }
                                className="w-full gap-3 justify-start h-10"
                            >
                                <Icons.leave
                                    className="w-5 h-5"
                                    color={theme.theme === 'dark' ? '#ffffff' : 'black'}
                                />
                                {!collapse && 'Chấm công'}
                            </Button>
                            <Button
                                onClick={() => handleNavitage('leave')}
                                variant={
                                    location.pathname.includes('leave') ? 'secondary' : 'ghost'
                                }
                                className="w-full gap-3 justify-start h-10"
                            >
                                <Icons.time
                                    className="w-5 h-5"
                                    color={theme.theme === 'dark' ? '#ffffff' : 'black'}
                                />
                                {!collapse && 'Nghỉ phép'}
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="px-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div
                                className="flex px-3 py-2 rounded-md flex-row gap-3 items-center cursor-pointer hover:bg-accent hover:text-accent-foreground">
                                <img
                                    src={`${user?.photoPath}`}
                                    alt="avatar"
                                    className={cn(' cursor-pointer  border rounded-full', collapse ? '' : 'w-10 h-10')}
                                />
                                {!collapse && user && user.employeeName &&
                                    <strong>{shorten(user.employeeName)}</strong>}{' '}
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="left" align="end">
                            <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link to="/settings/profile" className="cursor-pointer flex gap-2">
                                    <UserRound /> Thông tin cá nhân
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/settings/password" className="cursor-pointer flex gap-2">
                                    <Lock /> Quản lý mật khẩu
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/settings" className="cursor-pointer flex gap-2">
                                    <Settings /> Cài đặt
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setOpenAlertLogout(true)}
                                className="cursor-pointer flex gap-2"
                            >
                                <LogOut />
                                Đăng xuất
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <AlertDialog open={openAlertLogout} onOpenChange={setOpenAlertLogout}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Bạn có chắc muốn đăng xuất?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Đăng xuất xong bạn sẽ không thể thao tác với dữ liệu của ứng dụng
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLogout}>Đăng xuất</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};
