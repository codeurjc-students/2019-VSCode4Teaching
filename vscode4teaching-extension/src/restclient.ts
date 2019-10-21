import axios, { AxiosRequestConfig, Method, AxiosPromise } from 'axios';

export class RestClient {
    private baseUrl: string | undefined;
    private jwtToken: string | undefined;

    constructor() {
    }

    login(username: string, password: string): AxiosPromise<any> {
        const data = {
            "username": username,
            "password": password
        };
        return axios(this.buildOptions("/login", "POST", data));
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

    setJwtToken(jwtToken: string) {
        this.jwtToken = jwtToken;
    }

    setUrl(url: string) {
        this.baseUrl = url;
    }
}