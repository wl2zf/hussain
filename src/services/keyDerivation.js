'use strict';

const crypto = require('crypto');
const { SCRYPT } = require('../utils/constants');

// اشتقاق مفتاح من كلمة مرور باستخدام scrypt.
// المعامل info يسمح باشتقاق مفاتيح منفصلة من نفس الملح (مثل مفتاح تشفير ومفتاح HMAC)
// عبر دمجه في الملح قبل التمرير لـ scrypt.
function deriveKey(password, salt, keylen, info = '') {
  if (typeof password !== 'string' || password.length === 0) {
    const err = new Error('كلمة المرور مطلوبة');
    err.status = 400;
    throw err;
  }

  const saltBuf = Buffer.isBuffer(salt) ? salt : Buffer.from(salt);
  const effectiveSalt = info
    ? crypto
        .createHash('sha256')
        .update(Buffer.concat([saltBuf, Buffer.from(info, 'utf8')]))
        .digest()
    : saltBuf;

  return crypto.scryptSync(password, effectiveSalt, keylen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
    maxmem: SCRYPT.maxmem,
  });
}

// معاملات الـ KDF لتضمينها في المغلّف (للتوثيق فقط؛ القيم ثابتة في هذا المشروع)
function kdfMeta(salt) {
  return {
    name: 'scrypt',
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
    salt: Buffer.isBuffer(salt) ? salt.toString('base64') : salt,
  };
}

module.exports = { deriveKey, kdfMeta };
