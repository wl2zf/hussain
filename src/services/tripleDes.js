'use strict';

const crypto = require('crypto');
const { deriveKey, kdfMeta } = require('./keyDerivation');

const ALG = 'Triple-DES-CBC';

// تشفير Triple-DES في وضع CBC مع Encrypt-then-MAC (HMAC-SHA256 بمفتاح منفصل).
// مفتاح التشفير (24 بايت) ومفتاح الـ MAC (32 بايت) يُشتقّان من نفس الملح بسياقين مختلفين.
function encrypt(buffer, password) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(8); // حجم كتلة DES = 8 بايت
  const encKey = deriveKey(password, salt, 24, 'enc');
  const macKey = deriveKey(password, salt, 32, 'mac');

  const cipher = crypto.createCipheriv('des-ede3-cbc', encKey, iv);
  const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);

  // Encrypt-then-MAC: نحسب الـ MAC على (iv || ciphertext)
  const mac = crypto
    .createHmac('sha256', macKey)
    .update(Buffer.concat([iv, ciphertext]))
    .digest();

  return {
    v: 1,
    alg: ALG,
    kdf: kdfMeta(salt),
    iv: iv.toString('base64'),
    data: ciphertext.toString('base64'),
    mac: mac.toString('base64'),
  };
}

function decrypt(env, password) {
  const salt = Buffer.from(env.kdf.salt, 'base64');
  const iv = Buffer.from(env.iv, 'base64');
  const ciphertext = Buffer.from(env.data, 'base64');
  const mac = Buffer.from(env.mac, 'base64');
  const encKey = deriveKey(password, salt, 24, 'enc');
  const macKey = deriveKey(password, salt, 32, 'mac');

  // نتحقق من الـ MAC أولًا (قبل فك التشفير) بمقارنة زمنية ثابتة
  const expected = crypto
    .createHmac('sha256', macKey)
    .update(Buffer.concat([iv, ciphertext]))
    .digest();

  if (mac.length !== expected.length || !crypto.timingSafeEqual(mac, expected)) {
    const err = new Error('فشل التحقق من سلامة البيانات (كلمة مرور خاطئة أو بيانات تالفة)');
    err.status = 400;
    throw err;
  }

  const decipher = crypto.createDecipheriv('des-ede3-cbc', encKey, iv);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

module.exports = { ALG, encrypt, decrypt };
