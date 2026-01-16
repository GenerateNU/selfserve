import { ServerRequest, ServerOptions } from 'srvx/types';
import { Hooks } from '../index.mjs';
import { BunOptions } from '../adapters/bun.mjs';
import { DenoOptions } from '../adapters/deno.mjs';
import { NodeOptions } from '../adapters/node.mjs';
import { SSEOptions } from '../adapters/sse.mjs';
import { CloudflareOptions } from '../adapters/cloudflare.mjs';

type WSOptions = Partial<Hooks> & {
    resolve?: (req: ServerRequest) => Partial<Hooks> | Promise<Partial<Hooks>>;
    options?: {
        bun?: BunOptions;
        deno?: DenoOptions;
        node?: NodeOptions;
        sse?: SSEOptions;
        cloudflare?: CloudflareOptions;
    };
};
type ServerWithWSOptions = ServerOptions & {
    websocket?: WSOptions;
};

export type { ServerWithWSOptions as S, WSOptions as W };
