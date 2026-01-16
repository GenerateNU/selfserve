import { Adapter, AdapterInstance, Peer, PeerContext, AdapterOptions } from '../index.mjs';
import { W as WebSocket } from '../shared/crossws.BQXMA5bH.mjs';
import uws from 'uWebSockets.js';

declare const StubRequest: {
    new (url: string, init?: RequestInit): Request;
};

type UserData = {
    peer?: UWSPeer;
    req: uws.HttpRequest;
    res: uws.HttpResponse;
    webReq: UWSReqProxy;
    protocol: string;
    extensions: string;
    context: PeerContext;
    namespace: string;
};
type WebSocketHandler = uws.WebSocketBehavior<UserData>;
interface UWSAdapter extends AdapterInstance {
    websocket: WebSocketHandler;
}
interface UWSOptions extends AdapterOptions {
    uws?: Exclude<uws.WebSocketBehavior<any>, "close" | "drain" | "message" | "open" | "ping" | "pong" | "subscription" | "upgrade">;
}
declare const uwsAdapter: Adapter<UWSAdapter, UWSOptions>;

declare class UWSPeer extends Peer<{
    peers: Set<UWSPeer>;
    request: UWSReqProxy;
    namespace: string;
    uws: uws.WebSocket<UserData>;
    ws: UwsWebSocketProxy;
    uwsData: UserData;
}> {
    get remoteAddress(): string | undefined;
    get context(): PeerContext;
    send(data: unknown, options?: {
        compress?: boolean;
    }): number;
    subscribe(topic: string): void;
    unsubscribe(topic: string): void;
    publish(topic: string, message: string, options?: {
        compress?: boolean;
    }): number;
    close(code?: number, reason?: uws.RecognizedString): void;
    terminate(): void;
}
declare class UWSReqProxy extends StubRequest {
    constructor(req: uws.HttpRequest);
}
declare class UwsWebSocketProxy implements Partial<WebSocket> {
    private _uws;
    readyState?: number;
    constructor(_uws: uws.WebSocket<UserData>);
    get bufferedAmount(): number;
    get protocol(): string;
    get extensions(): string;
}

export { uwsAdapter as default };
export type { UWSAdapter, UWSOptions };
