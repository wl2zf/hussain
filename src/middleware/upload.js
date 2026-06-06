'use strict';

const multer = require('multer');
const { MAX_FILE_SIZE, MAX_FIELD_SIZE } = require('../utils/constants');

// تخزين الملفات في الذاكرة (memory storage) — لا تُكتب على القرص.
// multer@2 مطلوب للتوافق مع Express 5.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE, // 50MB للملف
    fieldSize: MAX_FIELD_SIZE, // مساحة كافية لنص كبير عبر الحقول
  },
});

module.exports = upload;
