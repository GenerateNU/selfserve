import { NodeRequest, serve as serve$1 } from 'srvx/node';
import nodeAdapter from '../adapters/node.mjs';
import '../shared/crossws.WpyOHUXc.mjs';
import '../shared/crossws.CPlNx7g8.mjs';
import '../shared/crossws.By9qWDAI.mjs';
import '../shared/crossws.CipVM6lf.mjs';
import 'stream';
import 'events';
import 'http';
import 'crypto';
import 'buffer';
import 'zlib';
import 'https';
import 'net';
import 'tls';
import 'url';
import '../shared/crossws.B31KJMcF.mjs';

function plugin(wsOpts) {
  return (server) => {
    const ws = nodeAdapter({
      hooks: wsOpts,
      resolve: wsOpts.resolve,
      ...wsOpts.options?.deno
    });
    const originalServe = server.serve;
    server.serve = () => {
      server.node?.server.on("upgrade", (req, socket, head) => {
        ws.handleUpgrade(
          req,
          socket,
          head,
          // @ts-expect-error (upgrade is not typed)
          new NodeRequest({ req, upgrade: { socket, head } })
        );
      });
      return originalServe.call(server);
    };
  };
}
function serve(options) {
  if (options.websocket) {
    options.plugins ||= [];
    options.plugins.push(plugin(options.websocket));
  }
  return serve$1(options);
}

export { plugin, serve };
