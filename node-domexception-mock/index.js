// Modern Node.js provides a native global DOMException.
// This mock redirects requests to the native global.DOMException to avoid registry deprecation warnings.
const DOMException = globalThis.DOMException || class DOMException extends Error {
  constructor(message, name) {
    super(message);
    this.name = name || "DOMException";
  }
};

module.exports = DOMException;
// Also support ESM default import interoperability
module.exports.default = DOMException;
