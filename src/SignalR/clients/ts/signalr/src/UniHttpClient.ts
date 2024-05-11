import { AbortError, HttpError } from "./Errors";
import { HttpClient, HttpRequest, HttpResponse } from "./HttpClient";
import { ILogger, LogLevel } from "./ILogger";

export class UniHttpClient extends HttpClient {
    private readonly _logger: ILogger;

    public constructor(logger: ILogger) {
        super();
        this._logger = logger;
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
            const temp: any = {
                url: request.url,
                method: request.method,
                data: request.content,
                dataType: 'string',
                header: request.headers,
                responseType: request.responseType,
                success: (res: any) => {
                    const response: HttpResponse = new HttpResponse(res.statusCode, res.errMsg, res.data)
                    resolve(response)
                },
                fail: (res: any) => {
                    this._logger.log(LogLevel.Warning, `Error from HTTP request. ${res.statusCode}: ${res.errMsg}.`);
                    reject(new HttpError(res.errMsg, res.statusCode));
                }
            }
            if (request.timeout) {
                temp.timeout = request.timeout;
            }


            const requestTask = uni.request(temp);


            if (request.abortSignal) {
                request.abortSignal.onabort = () => {
                    requestTask.abort();
                    reject(new AbortError());
                };
            }
        });
    }
}