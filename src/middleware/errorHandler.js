'use strict';

const multer = require('multer');
const { MAX_FILE_SIZE } = require('../utils/constants');

// معالج أخطاء مركزي: يحوّل أي خطأ إلى استجابة JSON موحّدة.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // أخطاء multer (مثل تجاوز حجم الملف)
  if (err instanceof multer.MulterError) {
    let message = 'خطأ في رفع الملف';
    if (err.code === 'LIMIT_FILE_SIZE') {
      const mb = Math.round(MAX_FILE_SIZE / (1024 * 1024));
      message = `حجم الملف يتجاوز الحد المسموح (${mb}MB)`;
    }
    return res.status(400).json({ ok: false, error: message });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'حدث خطأ داخلي في الخادم' : err.message;

  if (status === 500) {
    // نسجّل الأخطاء غير المتوقعة فقط
    console.error(err);
  }

  return res.status(status).json({ ok: false, error: message });
}

module.exports = errorHandler;
