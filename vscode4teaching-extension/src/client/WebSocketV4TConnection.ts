import * as WebSocket from "ws";
import { APIClientSession } from "./APIClientSession";

export class WebSocketV4TConnection {

    private ws: WebSocket | undefined;
    private wsTimeout: NodeJS.Timeout | undefined;
    private wsPingInterval: NodeJS.Timeout | undefined;

    constructor(private channel: string, private callback: ((data: any) => void)) {
        this.connect(this.channel, this.callback);
    }
    public send(data: any, cb?: (err?: Error) => void) {
        this.ws?.send(data, cb);
    }

    private connect(channel: string, callback: ((data: any) => void)) {
        const authToken = APIClientSession.jwtToken;
        const wsURL = APIClientSession.baseUrl.replace("http", "ws");
        const startConnectionDate = new Date().getTime();
        if (authToken && wsURL) {
            this.ws = new WebSocket(`${wsURL}/${channel}?bearer=${authToken}`);
            const wsHeartbeat = (websocket: WebSocket) => {
                console.log("ws ping" + this.channel + ": " + new Date(new Date().getTime() - startConnectionDate).toISOString());
                if (this.wsTimeout) {
                    global.clearTimeout(this.wsTimeout);
                }
                // Delay should be equal to the interval at which your server
                // sends out pings plus a conservative assumption of the latency.
                this.wsTimeout = global.setTimeout(() => {
                    console.warn("Timeout on websocket connection. Trying to reconnect...");
                    websocket.terminate();
                    this.connect(channel, callback);
                  }, 30000);
            };
            this.ws.on("open", wsHeartbeat);
            this.ws.on("ping", wsHeartbeat);
            this.ws.on("pong", wsHeartbeat);
            this.ws.on("close", () => {
                if (this.wsTimeout) {
                    global.clearTimeout(this.wsTimeout);
                }
                if (this.wsPingInterval) {
                    global.clearInterval(this.wsPingInterval);
                }
            });
            this.ws.onmessage = (data) => {
                callback(data);
            };
            if (this.wsPingInterval) {
                global.clearInterval(this.wsPingInterval);
            }
            // Ping periodically to keep connection alive
            this.wsPingInterval = global.setInterval(() => {
                this.ws?.ping();
            }, 30000);
        } else { console.error("Could not connect with websockets"); }
    }
}
