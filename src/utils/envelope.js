'use strict';

// مغلّف موحّد لنتيجة التشفير.
// نحوّل كائن JSON إلى نص base64 واحد لتسهيل النقل/التخزين، والعكس.

function pack(obj) {
  return Buffer.from(JSON.stringify(obj), 'utf8').toString('base64');
}

function unpack(str) {
  if (typeof str !== 'string' || str.trim() === '') {
    const err = new Error('النص المشفّر مفقود أو غير صالح');
    err.status = 400;
    throw err;
  }
  try {
    const json = Buffer.from(str.trim(), 'base64').toString('utf8');
    const obj = JSON.parse(json);
    if (!obj || typeof obj !== 'object' || !obj.alg) {
      throw new Error('بنية المغلّف غير صحيحة');
    }
    return obj;
  } catch (e) {
    const err = new Error('تعذّر قراءة البيانات المشفّرة (مغلّف تالف أو غير صالح)');
    err.status = 400;
    throw err;
  }
}

module.exports = { pack, unpack };
