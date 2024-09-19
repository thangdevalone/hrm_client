/* eslint-disable @typescript-eslint/no-unused-vars */
import { InfoUser, LoginForm } from '@/models';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface AuthState {
    logging?: boolean;
    registering?: boolean;
    actionAuth: 'No action' | 'Success' | 'Failed';
    currentUser?: InfoUser;
}

const initialState: AuthState = {
    logging: false,
    registering: false,
    actionAuth: 'No action',
    currentUser: undefined,
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<LoginForm>) {
            state.logging = true;
            state.actionAuth = 'No action';
        },
        setUser(state,action:PayloadAction<InfoUser>){
            state.currentUser=action.payload
        },
        loginSuccess(state, action: PayloadAction<InfoUser>) {
            state.logging = false;
            state.actionAuth = 'Success';
            state.currentUser = action.payload;
        },
        loginFailed(state) {
            state.logging = false;
            state.actionAuth = 'Failed';
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        register(state, action) {
            state.registering = true;
            state.actionAuth = 'No action';
        },
        registerSuccess(state, action: PayloadAction<InfoUser>) {
            state.registering = false;
            state.actionAuth = 'Success';
            state.currentUser = action.payload;
        },
        registerFailed(state) {
            state.registering = false;
            state.actionAuth = 'Failed';
        },
        logout(state) {
            state.logging = false;
            state.registering = false;
            state.actionAuth = 'No action';
            state.currentUser = undefined;
        },
        resetAction(state) {
            state.actionAuth = 'No action';
        },
    },
});

export const authActions = authSlice.actions;
const authReducer = authSlice.reducer;
export default authReducer;
