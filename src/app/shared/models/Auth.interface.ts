import { User } from "./User.interface";

export interface LoginResponse {
    user: User;
    token: Token;
}

export interface LoginRequest {
    username: string;
    password: string;
    recaptchaToken: string;
}

export interface Token {
    accessToken: string;
    expiry: string;
}