const StubRequest = /* @__PURE__ */ (() => {
  class StubRequest2 {
    url;
    _signal;
    _headers;
    _init;
    constructor(url, init = {}) {
      this.url = url;
      this._init = init;
    }
    get headers() {
      if (!this._headers) {
        this._headers = new Headers(this._init?.headers);
      }
      return this._headers;
    }
    clone() {
      return new StubRequest2(this.url, this._init);
    }
    // --- dummy ---
    get method() {
      return "GET";
    }
    get signal() {
      return this._signal ??= new AbortSignal();
    }
    get cache() {
      return "default";
    }
    get credentials() {
      return "same-origin";
    }
    get destination() {
      return "";
    }
    get integrity() {
      return "";
    }
    get keepalive() {
      return false;
    }
    get redirect() {
      return "follow";
    }
    get mode() {
      return "cors";
    }
    get referrer() {
      return "about:client";
    }
    get referrerPolicy() {
      return "";
    }
    get body() {
      return null;
    }
    get bodyUsed() {
      return false;
    }
    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(0));
    }
    blob() {
      return Promise.resolve(new Blob());
    }
    bytes() {
      return Promise.resolve(new Uint8Array());
    }
    formData() {
      return Promise.resolve(new FormData());
    }
    json() {
      return Promise.resolve(JSON.parse(""));
    }
    text() {
      return Promise.resolve("");
    }
  }
  Object.setPrototypeOf(StubRequest2.prototype, globalThis.Request.prototype);
  return StubRequest2;
})();

export { StubRequest as S };
