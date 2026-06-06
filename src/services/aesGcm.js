'use strict';

const crypto = require('crypto');
const { deriveKey, kdfMeta } = require('./keyDerivation');

const ALG = 'AES-256-GCM';
const AAD = Buffer.from('CipherForge:AES-256-GCM', 'utf8');

// تشفير AES-256-GCM (متماثل مع توثيق مدمج). يعتمد على كلمة مرور.
function encrypt(buffer, password) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = deriveKey(password, salt, 32);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(AAD);
  const data = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    v: 1,
    alg: ALG,
    kdf: kdfMeta(salt),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: data.toString('base64'),
  };
}

function decrypt(env, password) {
  const salt = Buffer.from(env.kdf.salt, 'base64');
  const iv = Buffer.from(env.iv, 'base64');
  const tag = Buffer.from(env.tag, 'base64');
  const key = deriveKey(password, salt, 32);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAAD(AAD);
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(Buffer.from(env.data, 'base64')),
    decipher.final(),
  ]);
}

module.exports = { ALG, encrypt, decrypt };
