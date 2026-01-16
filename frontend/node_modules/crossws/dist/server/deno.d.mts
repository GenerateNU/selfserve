import { ServerPlugin, Server } from 'srvx/types';
import { W as WSOptions, S as ServerWithWSOptions } from '../shared/crossws.95-eYp2D.mjs';
import '../index.mjs';
import '../shared/crossws.BQXMA5bH.mjs';
import '../adapters/bun.mjs';
import 'bun';
import '../adapters/deno.mjs';
import '../adapters/node.mjs';
import 'node:http';
import 'node:stream';
import 'events';
import 'node:https';
import 'node:tls';
import 'node:url';
import 'node:zlib';
import '../adapters/sse.mjs';
import '../adapters/cloudflare.mjs';
import '@cloudflare/workers-types';
import 'cloudflare:workers';

declare function plugin(wsOpts: WSOptions): ServerPlugin;
declare function serve(options: ServerWithWSOptions): Server;

export { plugin, serve };
