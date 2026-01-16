import { M as Message, P as Peer, t as toBufferLike } from '../shared/crossws.WpyOHUXc.mjs';
import { a as adapterUtils, A as AdapterHookable, g as getPeers } from '../shared/crossws.CPlNx7g8.mjs';
import { W as WSError } from '../shared/crossws.By9qWDAI.mjs';

const denoAdapter = (options = {}) => {
  if (typeof Deno === "undefined") {
    throw new Error(
      "[crossws] Using Deno adapter in an incompatible environment."
    );
  }
  const hooks = new AdapterHookable(options);
  const globalPeers = /* @__PURE__ */ new Map();
  return {
    ...adapterUtils(globalPeers),
    handleUpgrade: async (request, info) => {
      const { upgradeHeaders, endResponse, context, namespace } = await hooks.upgrade(request);
      if (endResponse) {
        return endResponse;
      }
      const headers = upgradeHeaders instanceof Headers ? upgradeHeaders : new Headers(upgradeHeaders);
      const upgrade = Deno.upgradeWebSocket(request, {
        // @ts-expect-error Setting headers is currently not supported in Deno
        // https://github.com/denoland/deno/issues/19277
        headers,
        protocol: headers.get("sec-websocket-protocol") ?? ""
      });
      const peers = getPeers(globalPeers, namespace);
      const peer = new DenoPeer({
        ws: upgrade.socket,
        request,
        peers,
        denoInfo: info,
        context,
        namespace
      });
      peers.add(peer);
      upgrade.socket.addEventListener("open", () => {
        hooks.callHook("open", peer);
      });
      upgrade.socket.addEventListener("message", (event) => {
        hooks.callHook("message", peer, new Message(event.data, peer, event));
      });
      upgrade.socket.addEventListener("close", () => {
        peers.delete(peer);
        hooks.callHook("close", peer, {});
      });
      upgrade.socket.addEventListener("error", (error) => {
        peers.delete(peer);
        hooks.callHook("error", peer, new WSError(error));
      });
      return upgrade.response;
    }
  };
};
class DenoPeer extends Peer {
  get remoteAddress() {
    return this._internal.denoInfo.remoteAddr?.hostname;
  }
  send(data) {
    return this._internal.ws.send(toBufferLike(data));
  }
  publish(topic, data) {
    const dataBuff = toBufferLike(data);
    for (const peer of this._internal.peers) {
      if (peer !== this && peer._topics.has(topic)) {
        peer._internal.ws.send(dataBuff);
      }
    }
  }
  close(code, reason) {
    this._internal.ws.close(code, reason);
  }
  terminate() {
    this._internal.ws.terminate();
  }
}

export { denoAdapter as default };
