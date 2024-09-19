import { InfoUser } from '.';

export interface LoginForm {
    username: string;
    password: string;
}

export interface LoginRes {
    code: number;
    data: LoginData;
}

export interface LoginData {
    token: string;
    authenticated: boolean;
    employee: InfoUser;
}
