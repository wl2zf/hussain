'use strict';

const aesGcm = require('./aesGcm');
const rsaOaep = require('./rsaOaep');
const chacha20 = require('./chacha20');
const tripleDes = require('./tripleDes');

// خريطة من معرّف الخوارزمية إلى الخدمة المسؤولة عنها.
const SERVICES = {
  'aes-256-gcm': aesGcm,
  'rsa-oaep-2048': rsaOaep,
  'chacha20-poly1305': chacha20,
  'triple-des-cbc': tripleDes,
};

// اختيار الخدمة حسب المعرّف، مع خطأ واضح إذا كان غير معروف.
function getService(algorithmId) {
  const svc = SERVICES[String(algorithmId || '').toLowerCase()];
  if (!svc) {
    const err = new Error('خوارزمية غير معروفة');
    err.status = 400;
    throw err;
  }
  return svc;
}

module.exports = { SERVICES, getService, aesGcm, rsaOaep, chacha20, tripleDes };
