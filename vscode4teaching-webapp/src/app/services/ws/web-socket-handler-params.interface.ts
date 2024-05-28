export interface WebSocketParams<T> {
    request: {
        url: string,
        withCredentials: true
    };
    onConnection: (event: Event) => void;
    onMessage: (message: T) => void;
    onError: ((error: T | any) => void) | undefined;
}
