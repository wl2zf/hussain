'use strict';

// حدود ومعاملات عامة للمشروع
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FIELD_SIZE = 60 * 1024 * 1024; // مساحة كافية لنص كبير عبر النموذج

// معاملات اشتقاق المفاتيح (scrypt)
const SCRYPT = {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
};

// قائمة الخوارزميات المعروضة في الواجهة
const ALGORITHMS = [
  {
    id: 'aes-256-gcm',
    name: 'AES-256-GCM',
    label: 'AES-256-GCM',
    description: 'تشفير متماثل سريع وآمن مع توثيق مدمج (AEAD). يعتمد على كلمة مرور.',
    auth: 'password',
  },
  {
    id: 'rsa-oaep-2048',
    name: 'RSA-OAEP-2048',
    label: 'RSA-OAEP (هجين)',
    description: 'تشفير غير متماثل هجين: RSA يشفّر مفتاح AES، وAES يشفّر البيانات. يعتمد على زوج مفاتيح.',
    auth: 'keys',
  },
  {
    id: 'chacha20-poly1305',
    name: 'ChaCha20-Poly1305',
    label: 'ChaCha20-Poly1305',
    description: 'تشفير متماثل حديث وسريع مع توثيق (AEAD). يعتمد على كلمة مرور.',
    auth: 'password',
  },
  {
    id: 'triple-des-cbc',
    name: 'Triple-DES-CBC',
    label: 'Triple-DES (CBC)',
    description: 'تشفير كلاسيكي بطريقة Encrypt-then-MAC مع HMAC-SHA256. يعتمد على كلمة مرور.',
    auth: 'password',
  },
];

const ALGORITHM_IDS = ALGORITHMS.map((a) => a.id);

module.exports = {
  MAX_FILE_SIZE,
  MAX_FIELD_SIZE,
  SCRYPT,
  ALGORITHMS,
  ALGORITHM_IDS,
};
