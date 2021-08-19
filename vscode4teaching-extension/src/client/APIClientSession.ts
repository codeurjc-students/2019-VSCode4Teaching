import axios, { AxiosRequestConfig } from "axios";
import FormData from "form-data";
import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as vscode from "vscode";
import { AxiosBuildOptions } from "./AxiosBuildOptions";
import { CurrentUser } from "./CurrentUser";

/**
 * Manages session information and files (tokens, url).
 * Thought to be used only by APIClient.
 */
class APIClientSessionSingleton {

    // APIClientSession is a singleton
    public readonly sessionPath = path.resolve(__dirname, "v4t", "v4tsession");
    public jwtToken: string | undefined;
    public xsrfToken: string | undefined;

    get baseUrl(): string {
        return vscode.workspace.getConfiguration("vscode4teaching").get("defaultServer", "https://edukafora.codeurjc.es");
    }

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
    }

    /**
     * Creates file with session credentials. Can be retrieved using initializeSessionCredentials()
     */
    public createSessionFile() {
        const v4tPath = path.resolve(this.sessionPath, "..");
        if (!fs.existsSync(v4tPath)) {
            mkdirp.sync(v4tPath);
        }
        fs.writeFileSync(this.sessionPath, this.jwtToken + "\n" + this.xsrfToken);
    }

    /**
     * Based on options creates an axios configuration with authorization.
     * @param options Axios build options from which to build the AxiosRequestConfig
     */
    public buildOptions(options: AxiosBuildOptions) {
        const axiosConfig: AxiosRequestConfig = {
            url: options.url,
            baseURL: this.baseUrl,
            method: options.method,
            data: options.data,
            headers: {
            },
            responseType: options.responseType,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        };
        if (this.jwtToken) {
            Object.assign(axiosConfig.headers, { Authorization: "Bearer " + this.jwtToken });
        }
        if (this.xsrfToken) {
            Object.assign(axiosConfig.headers, { "X-XSRF-TOKEN": this.xsrfToken });
            Object.assign(axiosConfig.headers, { Cookie: "XSRF-TOKEN=" + this.xsrfToken });
        }
        let timeout;
        if (options.data instanceof FormData) {
            Object.assign(axiosConfig.headers, options.data.getHeaders());
        } else {
            const CancelToken = axios.CancelToken;
            const source = CancelToken.source();
            if (source) {
                axiosConfig.cancelToken = source.token;
                timeout = setTimeout(() => {
                    source.cancel();
                }, 10000);
            }
        }
        return { axiosOptions: axiosConfig, timeout };
    }
}
export let APIClientSession = new APIClientSessionSingleton();
