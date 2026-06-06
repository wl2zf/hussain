'use strict';

const crypto = require('crypto');

const ALG = 'RSA-OAEP-2048';
const AAD = Buffer.from('CipherForge:RSA-OAEP-2048', 'utf8');

// توليد زوج مفاتيح RSA بطول 2048 بت بصيغة PEM.
function generateKeyPair() {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
}

// تشفير هجين: مفتاح AES عشوائي يشفّر البيانات، وRSA-OAEP يشفّر مفتاح AES.
function encrypt(buffer, publicKeyPem) {
  if (typeof publicKeyPem !== 'string' || !publicKeyPem.includes('BEGIN')) {
    const err = new Error('المفتاح العام (PEM) مطلوب وغير صالح');
    err.status = 400;
    throw err;
  }

  const aesKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
  cipher.setAAD(AAD);
  const data = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  const encKey = crypto.publicEncrypt(
    {
      key: publicKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    aesKey
  );

  return {
    v: 1,
    alg: ALG,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: data.toString('base64'),
    encKey: encKey.toString('base64'),
  };
}

function decrypt(env, privateKeyPem) {
  if (typeof privateKeyPem !== 'string' || !privateKeyPem.includes('BEGIN')) {
    const err = new Error('المفتاح الخاص (PEM) مطلوب وغير صالح');
    err.status = 400;
    throw err;
  }

  const aesKey = crypto.privateDecrypt(
    {
      key: privateKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(env.encKey, 'base64')
  );

  const iv = Buffer.from(env.iv, 'base64');
  const tag = Buffer.from(env.tag, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
  decipher.setAAD(AAD);
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(Buffer.from(env.data, 'base64')),
    decipher.final(),
  ]);
}

module.exports = { ALG, encrypt, decrypt, generateKeyPair };
