import { LoadingPage } from '@/components/common/LoadingPage';
import { ModeToggle } from '@/components/mode-toggle';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useState } from 'react';
import Particles from 'react-tsparticles';
import Typed from 'react-typed';
import type { Engine } from 'tsparticles-engine';
import { loadSlim } from 'tsparticles-slim';
import './styles.css';
import { useInfoUser } from '@/hooks';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Home, LogOut, SquareUserRound } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDispatch } from 'react-redux';
import { authActions } from '../auth/AuthSlice';
import { STATIC_HOST_NO_SPLASH } from '@/constants';
import { Link } from 'react-router-dom';

export default function Welcome() {
    const { theme } = useTheme();
    const [showTyped, setShowTyped] = useState(false);
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);
    const user = useInfoUser();
    const [openAlertLogout, setOpenAlertLogout] = useState(false);
    const dispatch = useDispatch();
    const handleLogout = () => {
        dispatch(authActions.logout());
    };
    useEffect(() => {
        // Set a timeout to show the Typed component after 2 seconds
        const timeoutId = setTimeout(() => {
            setShowTyped(true);
        }, 1000);
        return () => {
            clearTimeout(timeoutId);
        };
    }, []);
    return (
        <div className="h-screen w-screen relative overflow-hidden">
            <LoadingPage />
            <header>
                <div className="py-5 px-[50px] flex items-center justify-between ">
                    <a href="/" className="cursor-pointer inline-block">
                        {theme == 'light' ? (
                            <img className="w-[300px]" src="/assets/logo-black.jpg" />
                        ) : (
                            <img className="w-[300px]" src="/assets/logo-white.png" />
                        )}
                    </a>
                    <div className="flex items-center gap-5">
                        <a
                            href="https://whiteneurons.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg mr-[20px] hover:underline font"
                        >
                            Trang chủ
                        </a>
                        <a
                            href="https://whiteneurons.com/contact.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg mr-[20px] hover:underline font"
                        >
                            Liên hệ
                        </a>
                        {!user ? (
                            <Link to="/login">
                                <Button>Đăng nhập</Button>
                            </Link>
                        ) : (
                            <>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <img
                                            src={`${STATIC_HOST_NO_SPLASH + user?.PhotoPath}`}
                                            alt="avatar"
                                            className=" cursor-pointer w-10 h-10 border rounded-full"
                                        />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="bottom" align="end">
                                        <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="cursor-pointer flex gap-2">
                                            <Link to="/settings/profile">
                                                <div className="flex flex-row cursor-pointer items-center gap-2">
                                                    <SquareUserRound />
                                                    Thông tin cá nhân
                                                </div>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="">
                                            <Link to="/home">
                                                <div className="flex flex-row cursor-pointer items-center gap-2">
                                                    <Home />
                                                    Trang chủ
                                                </div>
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
                                <AlertDialog
                                    open={openAlertLogout}
                                    onOpenChange={setOpenAlertLogout}
                                >
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Bạn có chắc muốn đăng xuất?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Đăng xuất xong bạn sẽ không thể thao tác với dữ liệu
                                                của ứng dụng
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleLogout}>
                                                Đăng xuất
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
                        <ModeToggle />
                    </div>
                </div>
            </header>
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={{
                    fpsLimit: 120,
                    interactivity: {
                        events: {
                            onHover: {
                                enable: true,
                                mode: 'repulse',
                            },
                            resize: true,
                        },
                        modes: {
                            repulse: {
                                distance: 140,
                                duration: 0.4,
                            },
                        },
                    },
                    particles: {
                        color: {
                            value: `${theme == 'dark' ? '#ffffff' : '#000000'}`,
                        },
                        links: {
                            color: `${theme == 'dark' ? '#ffffff' : '#000000'}`,
                            distance: 200,
                            enable: true,
                            opacity: 0.5,
                            width: 1,
                        },
                        move: {
                            direction: 'none',
                            enable: true,
                            outModes: {
                                default: 'bounce',
                            },
                            random: false,
                            speed: 2,
                            straight: false,
                        },
                        number: {
                            density: {
                                enable: true,
                                area: 600,
                            },
                            value: 40,
                        },
                        opacity: {
                            value: 0.5,
                        },
                        shape: {
                            type: 'circle',
                        },
                        size: {
                            value: { min: 1, max: 5 },
                        },
                    },
                    detectRetina: true,
                }}
            />
            <section className="main-content mx-auto">
                <div className="container text-center flex flex-col items-center max-w-[1024px] pt-[100px]">
                    <div className="max-w-[800px]">
                        <h1 className="text-[3.5rem] leading-[1.5] mb-4 font-bold">
                            {showTyped && (
                                <Typed
                                    strings={[
                                        'Chào mừng đến với ứng dụng quản trị nhân sự',
                                        'Một sản phẩm của công ty White Neuron',
                                    ]}
                                    typeSpeed={60}
                                    backSpeed={40}
                                    backDelay={1500}
                                    loop
                                />
                            )}
                        </h1>
                        <p className="leading-[1.875] mb-7 px-[10px]">
                            Ứng dụng được phát triển và xây dựng cho cục bộ không nhằm mục đích kiếm
                            tiền. Mọi thắc mắc xin liên hệ với công ty để được hướng dẫn và giải
                            quyết!{' '}
                        </p>
                        <a href="/login">
                            <Button
                                className="w-[250px] h-[50px] border-black dark:border-white"
                                variant={'outline'}
                            >
                                Bắt đầu ngay!
                            </Button>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
