import axios, { AxiosPromise, AxiosRequestConfig, Method } from 'axios';
import { User, Exercise } from './model';

export class RestClient {
    private _baseUrl: string | undefined;
    private _jwtToken: string | undefined;
    private _xsrfToken = "";

    constructor() {
    }

    login(username: string, password: string): AxiosPromise<{ jwtToken: string }> {
        const data = {
            "username": username,
            "password": password
        };
        return axios(this.buildOptions("/api/login", "POST", false, data));
    }

    async getCsrfToken() {
        let response = await axios(this.buildOptions("/api/csrf", "GET", false));
        let cookiesString: string | undefined = response.headers['set-cookie'][0];
        if (cookiesString) {
            let cookies = cookiesString.split(";");
            let xsrfCookie = cookies.find(cookie => cookie.includes("XSRF-TOKEN"));
            if (xsrfCookie) {
                this.xsrfToken = xsrfCookie.split("=")[1];
            }
        }
    }

    getUserInfo(): AxiosPromise<User> {
        return axios(this.buildOptions("/api/currentuser", "GET", false));
    }

    getExercises(courseId: number): AxiosPromise<Exercise[]> {
        return axios(this.buildOptions("/api/courses/" + courseId + "/exercises", "GET", false));
    }

    getExerciseFiles(exerciseId: number) {
        return axios(this.buildOptions("/api/exercises/" + exerciseId + "/files", "GET", true));
    }

    addCourse(name: string) {
        let data = {
            name: name
        };
        return axios(this.buildOptions("/api/courses", "POST", false, data));
    }

    private buildOptions(url: string, method: Method, isArrayBuffer: boolean, data?: any): AxiosRequestConfig {
        let options: AxiosRequestConfig = {
            url: url,
            baseURL: this.baseUrl,
            method: method,
            data: data,
            headers: {
            },
            responseType: isArrayBuffer ? "arraybuffer" : "json"
        };
        if (this.jwtToken) {
            Object.assign(options.headers, { "Authorization": "Bearer " + this.jwtToken });
        }
        if (this.xsrfToken !== "") {
            Object.assign(options.headers, { "X-XSRF-TOKEN": this.xsrfToken });
            Object.assign(options.headers, { "Cookie": "XSRF-TOKEN=" + this.xsrfToken });
        }
        return options;
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

    get xsrfToken(): string {
        return this._xsrfToken;
    }

    set xsrfToken(xsrfToken: string) {
        this._xsrfToken = xsrfToken;
    }
}