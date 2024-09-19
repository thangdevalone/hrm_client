import { ThemeProvider } from '@/components/theme-provider';
import dayjs from 'dayjs';
import vi from 'dayjs/locale/vi';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './app.css';
import { ProtectAdmin, ProtectAdminHrManager, ProtectAuth, ProtectHome } from './components/ProtectRoute';
import { NotFound } from './components/common';
import { LoginPage } from './features/auth/pages/LoginPage';
import Home from './features/home';
import { Admin, OverView, PIM, TimeKeep } from './features/home/components';
import {
    Accounts,
    ManagerDepartment,
    ManagerJob,
    ManagerRole,
    Organization,
} from './features/home/components/AdminComponents';
import { EmployeeDetail, EmployeeList } from './features/home/components/PimComponents';
import { TimeKeepList } from './features/home/components/TimeKeepComponents';
import Welcome from './features/welcome';
import { PermissionProvider } from './utils';
import { SettingsLayout } from './features/settings/SettingsLayout';
import { ManagerNotification, ManagerPass, Personalisation, Profile } from './features/settings';
import { NewPass } from './features/NewPass';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { useEffect, useState } from 'react';
import StorageKeys from './constants/storage-keys';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './components/ui/alert-dialog';
import { useDispatch } from 'react-redux';
import { authActions } from './features/auth/AuthSlice';

const checkTokenExpiration = (token: string) => {
    const decodedToken = jwtDecode<JwtPayload>(token);
    const currentTime = Date.now() / 1000; // Chuyển đổi thời gian hiện tại sang định dạng Unix time

    // Kiểm tra xem thời gian hết hạn của token có lớn hơn thời gian hiện tại hay không
    if (decodedToken && decodedToken?.exp) {
        if (decodedToken.exp < currentTime) {
            // Token đã hết hạn, chuyển hướng người dùng đến trang đăng nhập
            return false;
        } else return true;
    }
};

function App() {
    dayjs.locale(vi);
    const P = PermissionProvider();
    const token = localStorage.getItem(StorageKeys.TOKEN);
    const location = useLocation();
    const [allertLogin, setAlertLogin] = useState(false);
    useEffect(() => {
        if (token) {
            if (!checkTokenExpiration(token)) {
                setAlertLogin(true);
            }
        }
    }, [location.pathname, token]);
    const dispath = useDispatch();
    return (
        <ThemeProvider defaultTheme="light" storageKey="theme">
            <div className="w-screen h-screen relative">
                <AlertDialog open={allertLogin} onOpenChange={setAlertLogin}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hết hạn phiên đăng nhập</AlertDialogTitle>
                            <AlertDialogDescription>
                                Yêu cầu đăng nhập lại do hết hạn phiên đăng nhập.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction
                                onClick={() => {
                                    dispath(authActions.logout());
                                }}
                            >
                                Đăng nhập
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Routes>
                    <Route path="/" element={<Welcome />} />
                    <Route element={<ProtectAuth />}>
                        <Route path="/login" element={<LoginPage />} />
                    </Route>
                    <Route element={<ProtectHome />}>
                        <Route path="/home" element={<Home />}>
                            <Route index element={<Navigate to="overview" />} />
                            <Route path="overview" element={<OverView />} />
                            <Route element={<ProtectAdmin />}>
                                <Route path="admin" element={<Admin />}>
                                    <Route index element={<Navigate to="accounts" />} />
                                    <Route path="job" element={<ManagerJob />} />
                                    <Route path="role" element={<ManagerRole />} />
                                    <Route path="department" element={<ManagerDepartment />} />
                                    <Route path="accounts" element={<Accounts />} />
                                    <Route path="organization" element={<Organization />} />
                                </Route>
                            </Route>
                            <Route element={<ProtectAdminHrManager />}>
                                <Route path="info-employee" element={<PIM />}>
                                    <Route index element={<Navigate to="list-employee" />} />
                                    <Route path="list-employee" element={<EmployeeList />} />
                                    <Route path=":idEmp" element={<EmployeeDetail />} />
                                </Route>
                            </Route>
                            <Route path="time-keep" element={<TimeKeep />}>
                                <Route
                                    index
                                    element={
                                        <Navigate
                                            to="timekeep-list"
                                        />
                                    }
                                />
                                <Route path="timekeep-list" element={<TimeKeepList />} />
                            </Route>
                        </Route>
                        <Route path="settings" element={<SettingsLayout />}>
                            <Route index element={<Navigate to="profile" />} />
                            <Route path="profile" element={<Profile />} />
                            <Route path="notification" element={<ManagerNotification />} />
                            <Route path="password" element={<ManagerPass />} />
                            <Route path="personalisation" element={<Personalisation />} />
                        </Route>
                    </Route>
                    <Route path="/forgot/reset-password/:token" element={<NewPass />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </ThemeProvider>
    );
}

export default App;
