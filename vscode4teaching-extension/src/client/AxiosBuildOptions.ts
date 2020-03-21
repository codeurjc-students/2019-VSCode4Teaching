import { Method } from "axios";

export interface AxiosBuildOptions {
    url: string;
    method: Method;
    responseType: "arraybuffer" | "json";
    data?: FormData | any;
}
