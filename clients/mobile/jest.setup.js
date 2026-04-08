if (typeof global.structuredClone === "undefined") {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

global.__ExpoImportMetaRegistry = { register: () => {} };
