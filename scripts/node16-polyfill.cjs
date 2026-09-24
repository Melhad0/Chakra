const crypto = require('crypto');

if (crypto.webcrypto) {
  if (!globalThis.crypto) {
    globalThis.crypto = crypto.webcrypto;
  }
  if (!crypto.getRandomValues) {
    crypto.getRandomValues = crypto.webcrypto.getRandomValues.bind(crypto.webcrypto);
  }
  if (!crypto.randomUUID && crypto.webcrypto.randomUUID) {
    crypto.randomUUID = crypto.webcrypto.randomUUID.bind(crypto.webcrypto);
  }
}
