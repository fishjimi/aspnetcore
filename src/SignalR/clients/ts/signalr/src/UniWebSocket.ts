export class UniWebSocket implements WebSocket {
    public binaryType: "blob" | "arraybuffer" = "blob";
    public bufferedAmount: number = 0;
    public extensions: string = "";
    public onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
    public onerror: ((this: WebSocket, ev: Event) => any) | null = null;
    public onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
    public onopen: ((this: WebSocket, ev: Event) => any) | null = null;
    public protocol: string = "";
    public readyState: number = 1;
    public url: string = "";

    private _socketTask: any = null;

    close(code?: number, reason?: string): void {
        this.readyState = this.CLOSING
        this._socketTask.close({
            code,
            reason
        })
    }
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
        this._socketTask.send({
            data
        });
    }

    constructor(url: string, protocols?: string | string[]) {
        this.url = url;
        this.protocol = protocols ? (typeof protocols === "string" ? protocols : protocols[0]) : "";
        this.readyState = this.CONNECTING

        this._socketTask = uni.connectSocket({
            url: this.url,
            success: () => {
                return this._socketTask;
            }
        })
        this._socketTask?.onClose?.((closeRes: string | ArrayBuffer) => {
            this.readyState = this.CLOSED
            console.log("close", closeRes)
            this.onclose?.(closeRes as any)
        })
        this._socketTask?.onError?.((errorRes: string | ArrayBuffer) => {
            console.log("error", errorRes)
            this.onerror?.(errorRes as any)
        })
        this._socketTask?.onMessage?.((messageRes: string | ArrayBuffer) => {
            this.onmessage?.(messageRes as any)
        })
        this._socketTask?.onOpen((openRes: string | ArrayBuffer) => {
            this.readyState = this.OPEN
            this.onopen?.(openRes as any)
        })
    }

    addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    // @ts-ignore
    addEventListener(type: any, listener: any, options?: any): void {
        throw new Error("Method not implemented.");
    }
    removeEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
    // @ts-ignore
    removeEventListener(type: any, listener: any, options?: any): void {
        throw new Error("Method not implemented.");
    }
    // @ts-ignore
    dispatchEvent(event: Event): boolean {
        throw new Error("Method not implemented.");
    }

    public readonly CLOSED = 3;
    public static readonly CLOSED: number = 3;
    public readonly CLOSING = 2;
    public static readonly CLOSING: number = 2;
    public readonly CONNECTING = 0;
    public static readonly CONNECTING: number = 0;
    public readonly OPEN = 1;
    public static readonly OPEN: number = 1;
}