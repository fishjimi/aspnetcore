JavaScript and TypeScript clients for SignalR for ASP.NET Core and Azure SignalR Service.

Support Uniapp

## Installation

```bash
npm install uniapp-signalr
# or
yarn add uniapp-signalr
```

## Usage

See the [SignalR Documentation](https://learn.microsoft.com/aspnet/core/signalr) at learn.microsoft.com for documentation on the latest release. [API Reference Documentation](https://learn.microsoft.com/javascript/api/%40aspnet/signalr/?view=signalr-js-latest) is also available on learn.microsoft.com.

For documentation on using this client with Azure SignalR Service and Azure Functions, see the [SignalR Service serverless developer guide](https://learn.microsoft.com/azure/azure-signalr/signalr-concept-serverless-development-config).


### Example (Uniapp)

```javascript
import * as signalR from "uniapp-signalr";

let connection = new signalR.HubConnectionBuilder()
    .withUrl("/chat")
    .build();

connection.on("send", data => {
    console.log(data);
});

connection.start()
    .then(() => connection.invoke("send", "Hello"));
```
