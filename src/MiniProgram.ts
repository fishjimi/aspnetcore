// Mini-program platform adapter for uniapp (uni), WeChat (wx), Alipay (my), ByteDance (tt), etc.

import { AbortError, HttpError } from "./Errors";
import { HttpClient, HttpRequest, HttpResponse } from "./HttpClient";
import { ILogger, LogLevel } from "./ILogger";
import { NullLogger } from "./Loggers";
import { WebSocketConstructor } from "./Polyfills";

/** Platform API interface for mini-program environments. */
export interface MiniProgramPlatform {
    /** e.g. uni.request / wx.request */
    request(options: any): any;
    /** e.g. uni.connectSocket / wx.connectSocket */
    connectSocket(options: any): any;
}

/** HTTP client implementation for mini-program platforms. */
export class MiniProgramHttpClient extends HttpClient {
    private readonly _logger: ILogger;
    private readonly _platform: MiniProgramPlatform;

    public constructor(logger: ILogger, platform: MiniProgramPlatform) {
        super();
        this._logger = logger;
        this._platform = platform;
    }

    /** @inheritDoc */
    public send(request: HttpRequest): Promise<HttpResponse> {
        // Check that abort was not signaled before calling send
        if (request.abortSignal && request.abortSignal.aborted) {
            return Promise.reject(new AbortError());
        }

        if (!request.method) {
            return Promise.reject(new Error("No method defined."));
        }
        if (!request.url) {
            return Promise.reject(new Error("No url defined."));
        }

        return new Promise<HttpResponse>((resolve, reject) => {
            const options: any = {
                url: request.url,
                method: request.method,
                data: request.content,
                dataType: "string",
                header: request.headers,
                responseType: request.responseType,
                success: (res: any) => {
                    resolve(new HttpResponse(res.statusCode, res.errMsg, res.data));
                },
                fail: (res: any) => {
                    this._logger.log(LogLevel.Warning, `Error from HTTP request. ${res.statusCode}: ${res.errMsg}.`);
                    reject(new HttpError(res.errMsg, res.statusCode));
                },
            };
            if (request.timeout) {
                options.timeout = request.timeout;
            }

            const requestTask = this._platform.request(options);

            if (request.abortSignal) {
                request.abortSignal.onabort = () => {
                    requestTask.abort();
                    reject(new AbortError());
                };
            }
        });
    }
}

/**
 * Returns IHttpConnectionOptions pre-configured for a mini-program platform.
 *
 * @example
 * ```ts
 * const connection = new HubConnectionBuilder()
 *     .withUrl("https://example.com/hub", {
 *         ...configureMiniProgram(uni),   // or wx / my / tt
 *     })
 *     .configureLogging(LogLevel.Information)
 *     .build();
 * ```
 */
export function configureMiniProgram(platform: MiniProgramPlatform, logger?: ILogger) {
    return {
        httpClient: new MiniProgramHttpClient(logger ?? NullLogger.instance, platform),
        WebSocket: createMiniProgramWebSocket(platform),
    };
}

/** Creates a WebSocket constructor compatible with mini-program platforms. */
export function createMiniProgramWebSocket(platform: MiniProgramPlatform): WebSocketConstructor {
    return class MiniProgramWebSocket {
        public binaryType: "blob" | "arraybuffer" = "blob";
        public bufferedAmount: number = 0;
        public extensions: string = "";
        public onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
        public onerror: ((this: WebSocket, ev: Event) => any) | null = null;
        public onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
        public onopen: ((this: WebSocket, ev: Event) => any) | null = null;
        public protocol: string = "";
        public readyState: 0 | 1 | 2 | 3 = 0;
        public url: string = "";

        private _socketTask: any = null;

        public readonly CLOSED = 3;
        public static readonly CLOSED: number = 3;
        public readonly CLOSING = 2;
        public static readonly CLOSING: number = 2;
        public readonly CONNECTING = 0;
        public static readonly CONNECTING: number = 0;
        public readonly OPEN = 1;
        public static readonly OPEN: number = 1;

        constructor(url: string, protocols?: string | string[]) {
            this.url = url;
            this.protocol = protocols ? (typeof protocols === "string" ? protocols : protocols[0]) : "";
            this.readyState = this.CONNECTING;

            this._socketTask = platform.connectSocket({
                url: this.url,
                success: () => {
                    return this._socketTask;
                },
            });
            this._socketTask?.onClose?.((closeRes: any) => {
                this.readyState = this.CLOSED;
                this.onclose?.(closeRes as any);
            });
            this._socketTask?.onError?.((errorRes: any) => {
                this.onerror?.(errorRes as any);
            });
            this._socketTask?.onMessage?.((messageRes: any) => {
                this.onmessage?.(messageRes as any);
            });
            this._socketTask?.onOpen?.((openRes: any) => {
                this.readyState = this.OPEN;
                this.onopen?.(openRes as any);
            });
        }

        public close(code?: number, reason?: string): void {
            this.readyState = this.CLOSING;
            this._socketTask.close({ code, reason });
        }

        public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
            this._socketTask.send({ data });
        }

        // @ts-ignore
        public addEventListener(type: any, listener: any, options?: any): void {
            throw new Error("Method not implemented.");
        }
        // @ts-ignore
        public removeEventListener(type: any, listener: any, options?: any): void {
            throw new Error("Method not implemented.");
        }
        // @ts-ignore
        public dispatchEvent(event: Event): boolean {
            throw new Error("Method not implemented.");
        }
    } as any as WebSocketConstructor;
}
