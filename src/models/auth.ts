import { InforUser } from '.';

export interface LoginForm {
    username: string;
    password: string;
}
export interface RegisterForm {
    fullName: string;
    username: string;
    email: string;
    password: string;
    rePassword: string;
}

export interface LoginRes {
    data: InforUser;
    response: string;
    token: Token;
    status: number;
}

export interface Token {
    refresh: string;
    access: string;
}
