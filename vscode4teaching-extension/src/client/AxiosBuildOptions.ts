import { Method } from "axios";

/**
 * Helper interface to create Axios Request Configurations
 */
export interface AxiosBuildOptions {
    url: string;
    method: Method;
    responseType: "arraybuffer" | "json";
    data?: FormData | any;
}
