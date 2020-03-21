import axios, { AxiosPromise, AxiosRequestConfig, Method } from "axios";
import * as FormData from "form-data";
import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";
import { AxiosBuildOptions } from "./AxiosBuildOptions";
import { CurrentUser } from "./CurrentUser";

export class APIClientSession {

    // APIClientSession is a singleton
    public static getClientSession() {
        if (!APIClientSession.instance) {
            APIClientSession.instance = new APIClientSession();
        }
        return APIClientSession.instance;
    }

    private static instance: APIClientSession | undefined;
    public readonly sessionPath = path.resolve(__dirname, "..", "v4t", "v4tsession");
    public baseUrl: string | undefined;
    public jwtToken: string | undefined;
    public xsrfToken: string | undefined;

    private constructor() { }

    /**
     * Initialize session variables with file created when logging in
     */
    public initializeSessionCredentials(): boolean {
        let success: boolean;
        if (fs.existsSync(this.sessionPath)) {
            const readSession = fs.readFileSync(this.sessionPath).toString();
            const sessionParts = readSession.split("\n");
            this.jwtToken = sessionParts[0];
            this.xsrfToken = sessionParts[1];
            this.baseUrl = sessionParts[2];
            success = true;
        } else {
            success = false;
        }
        return success;
    }

    /**
     * Invalidates current session and deletes session file
     */
    public invalidateSession() {
        if (fs.existsSync(this.sessionPath)) {
            fs.unlinkSync(this.sessionPath);
        }
        this.jwtToken = undefined;
        this.xsrfToken = undefined;
        CurrentUser.resetUserInfo();
        this.baseUrl = undefined;
    }

    public createSessionFile() {
        const v4tPath = path.resolve(this.sessionPath, "..");
        if (!fs.existsSync(v4tPath)) {
            mkdirp.sync(v4tPath);
        }
        fs.writeFileSync(this.sessionPath, this.jwtToken + "\n" + this.xsrfToken + "\n" + this.baseUrl);
    }

    public buildOptions(options: AxiosBuildOptions): AxiosRequestConfig {
        const axiosConfig: AxiosRequestConfig = {
            url: options.url,
            baseURL: this.baseUrl,
            method: options.method,
            data: options.data,
            headers: {
            },
            responseType: options.responseType,
            maxContentLength: Infinity,
        };
        if (this.jwtToken) {
            Object.assign(axiosConfig.headers, { Authorization: "Bearer " + this.jwtToken });
        }
        if (this.xsrfToken) {
            Object.assign(axiosConfig.headers, { "X-XSRF-TOKEN": this.xsrfToken });
            Object.assign(axiosConfig.headers, { Cookie: "XSRF-TOKEN=" + this.xsrfToken });
        }
        if (options.data instanceof FormData) {
            Object.assign(axiosConfig.headers, options.data.getHeaders());
        }
        return axiosConfig;
    }
}
