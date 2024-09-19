import authApi from '@/api/authApi';
import StorageKeys from '@/constants/storage-keys';
import { LoginForm, LoginRes } from '@/models';
import History from '@/router/History';

import { PayloadAction } from '@reduxjs/toolkit';
import { call, delay, put, takeLatest } from 'redux-saga/effects';
import { authActions } from './AuthSlice';

function* handleLogin(action: PayloadAction<LoginForm>) {
    try {
        const res: LoginRes = yield call(authApi.login, action.payload);
        yield put(authActions.loginSuccess(res.data.employee));
        localStorage.setItem(StorageKeys.TOKEN, res.data.token);

        History.push('/home');
    } catch (error) {
        // Handle the error here
        yield put(authActions.loginFailed());
        yield delay(100);
        yield put(authActions.resetAction());
    }
}

// function* handleRegister(action: PayloadAction<RegisterForm>) {
//     try {
//         // const res: ApiResAuth = yield call(authApi.register, action.payload)
//         // const user = res.data
//         // yield put(authActions.registerSuccess(user))
//         // localStorage.setItem(StorageKeys.TOKEN, user.token)
//         // localStorage.setItem(StorageKeys.NAMEUSER, user.accountName)
//         // localStorage.setItem(StorageKeys.USER, JSON.stringify(user))
//         History.push('/');
//     } catch (error) {
//         // Handle the error here
//         yield put(authActions.registerFailed());
//         yield delay(100);
//         yield put(authActions.resetAction());
//     }
// }
function handleLogout() {
    localStorage.removeItem(StorageKeys.TOKEN);
    History.push('/login');

}

export function* authSaga() {
    yield takeLatest(authActions.login.type, handleLogin);
    // yield takeLatest(authActions.register.type, handleRegister);
    yield takeLatest(authActions.logout.type, handleLogout);
}
