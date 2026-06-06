'use strict';

const crypto = require('crypto');
const { deriveKey, kdfMeta } = require('./keyDerivation');

const ALG = 'ChaCha20-Poly1305';
const AAD = Buffer.from('CipherForge:ChaCha20-Poly1305', 'utf8');

// تشفير ChaCha20-Poly1305 (متماثل حديث مع توثيق). يعتمد على كلمة مرور.
function encrypt(buffer, password) {
  const salt = crypto.randomBytes(16);
  const nonce = crypto.randomBytes(12);
  const key = deriveKey(password, salt, 32);

  const cipher = crypto.createCipheriv('chacha20-poly1305', key, nonce, {
    authTagLength: 16,
  });
  // ملاحظة مهمة: نستخدم setAAD بدون خيار plaintextLength
  cipher.setAAD(AAD);
  const data = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    v: 1,
    alg: ALG,
    kdf: kdfMeta(salt),
    iv: nonce.toString('base64'),
    tag: tag.toString('base64'),
    data: data.toString('base64'),
  };
}

function decrypt(env, password) {
  const salt = Buffer.from(env.kdf.salt, 'base64');
  const nonce = Buffer.from(env.iv, 'base64');
  const tag = Buffer.from(env.tag, 'base64');
  const key = deriveKey(password, salt, 32);

  const decipher = crypto.createDecipheriv('chacha20-poly1305', key, nonce, {
    authTagLength: 16,
  });
  decipher.setAAD(AAD);
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(Buffer.from(env.data, 'base64')),
    decipher.final(),
  ]);
}

module.exports = { ALG, encrypt, decrypt };
