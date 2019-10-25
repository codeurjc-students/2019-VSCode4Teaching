import axios, { AxiosRequestConfig, Method, AxiosPromise } from 'axios';
import { User, Exercise } from './model';

export class RestClient {
    private _baseUrl: string | undefined;
    private _jwtToken: string | undefined;

    constructor() {
    }

    login(username: string, password: string): AxiosPromise<{ jwtToken: string }> {
        const data = {
            "username": username,
            "password": password
        };
        return axios(this.buildOptions("/api/login", "POST", data));
    }

    getUserInfo(): AxiosPromise<User> {
        return axios(this.buildOptions("/api/currentuser", "GET"));
    }

    getExercises(courseId: number): AxiosPromise<Exercise[]> {
        return axios(this.buildOptions("/api/courses/" + courseId + "/exercises", "GET"));
    }

    private buildOptions(url: string, method: Method, data?: any): AxiosRequestConfig {
        if (this.jwtToken) {
            return {
                url: url,
                baseURL: this.baseUrl,
                method: method,
                data: data,
                headers: { "Authorization": "Bearer " + this.jwtToken }
            };
        }
        else {
            return {
                url: url,
                baseURL: this.baseUrl,
                method: method,
                data: data
            };
        }
    }

    set jwtToken(jwtToken: string | undefined) {
        this._jwtToken = jwtToken;
    }

    get jwtToken() {
        return this._jwtToken;
    }

    get baseUrl() {
        return this._baseUrl;
    }

    set baseUrl(url: string | undefined) {
        this._baseUrl = url;
    }
}