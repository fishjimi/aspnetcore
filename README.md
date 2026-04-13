# uniapp-signalr

ASP.NET Core SignalR JavaScript client with mini-program support.

Based on the official [@microsoft/signalr](https://github.com/dotnet/aspnetcore) v10.0.0 source code, with added support for mini-program platforms (uniapp / WeChat / Alipay / ByteDance / etc).

## Installation

```bash
npm install uniapp-signalr
# or
yarn add uniapp-signalr
# or
pnpm add uniapp-signalr
```

## Quick Start

### Mini-program (uniapp / WeChat / Alipay / ...)

```typescript
import { HubConnectionBuilder, configureMiniProgram, LogLevel } from "uniapp-signalr";

// uniapp
const connection = new HubConnectionBuilder()
    .withUrl("https://example.com/hub", {
        ...configureMiniProgram(uni),
    })
    .configureLogging(LogLevel.Information)
    .build();

// WeChat native mini-program — just swap uni → wx
const connection = new HubConnectionBuilder()
    .withUrl("https://example.com/hub", {
        ...configureMiniProgram(wx),
    })
    .build();

connection.on("ReceiveMessage", (user, message) => {
    console.log(`${user}: ${message}`);
});

connection.start()
    .then(() => connection.invoke("SendMessage", "Hello"));
```

> **Note:** Mini-program environments must use **absolute URLs** (e.g. `https://example.com/hub`), relative URLs are not supported.

### Browser / Node.js

In non-mini-program environments, usage is the same as the official `@microsoft/signalr`:

```typescript
import { HubConnectionBuilder } from "uniapp-signalr";

const connection = new HubConnectionBuilder()
    .withUrl("/hub")
    .build();
```

## API

### `configureMiniProgram(platform, logger?)`

Returns pre-configured `httpClient` and `WebSocket` options for the given mini-program platform. Spread the result into `withUrl` options.

| Param | Type | Description |
|-------|------|-------------|
| `platform` | `MiniProgramPlatform` | The platform global object — `uni`, `wx`, `my`, `tt`, etc. |
| `logger` | `ILogger` (optional) | Custom logger for the HTTP client. Defaults to `NullLogger`. |

### Advanced: Manual Configuration

If you need more control, you can configure the HTTP client and WebSocket separately:

```typescript
import {
    HubConnectionBuilder,
    MiniProgramHttpClient,
    createMiniProgramWebSocket,
    ConsoleLogger,
    LogLevel,
} from "uniapp-signalr";

const logger = new ConsoleLogger(LogLevel.Information);

const connection = new HubConnectionBuilder()
    .withUrl("https://example.com/hub", {
        httpClient: new MiniProgramHttpClient(logger, wx),
        WebSocket: createMiniProgramWebSocket(wx),
    })
    .build();
```

### Supported Platforms

| Platform | Global Object | Tested |
|----------|--------------|--------|
| uniapp   | `uni`        | Yes    |
| WeChat   | `wx`         | Yes    |
| Alipay   | `my`         | -      |
| ByteDance| `tt`         | -      |

Any platform that implements `request()` and `connectSocket()` with the standard mini-program API conventions is supported.

## Compared to `@microsoft/signalr`

This package is a minimal fork. The only source code modification is in `HttpConnection._resolveNegotiateUrl()`, which uses manual string concatenation instead of `URL`/`URLSearchParams` (unavailable in mini-program environments). All other mini-program support is implemented externally via SignalR's built-in `httpClient` and `WebSocket` extension points.

## Documentation

- [ASP.NET Core SignalR Documentation](https://learn.microsoft.com/aspnet/core/signalr)
- [SignalR JavaScript Client API Reference](https://learn.microsoft.com/javascript/api/%40aspnet/signalr/?view=signalr-js-latest)
- [Azure SignalR Service Serverless Guide](https://learn.microsoft.com/azure/azure-signalr/signalr-concept-serverless-development-config)

## License

MIT
