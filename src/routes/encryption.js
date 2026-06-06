'use strict';

const express = require('express');
const upload = require('../middleware/upload');
const { getService } = require('../services');
const envelope = require('../utils/envelope');

const router = express.Router();

const VALID_TYPES = ['text', 'file', 'image', 'audio'];
const RSA_ID = 'rsa-oaep-2048';

function assertType(type) {
  if (!VALID_TYPES.includes(type)) {
    const err = new Error('نوع غير مدعوم (المسموح: text, file, image, audio)');
    err.status = 400;
    throw err;
  }
}

// ===== التشفير =====
// يُرسل عبر multipart/form-data: algorithm, password/publicKey, و(text أو file)
router.post('/encrypt/:type', upload.single('file'), (req, res, next) => {
  try {
    const { type } = req.params;
    assertType(type);

    const { algorithm, password, publicKey } = req.body;
    const svc = getService(algorithm);

    let input;
    let filename;
    if (type === 'text') {
      if (typeof req.body.text !== 'string' || req.body.text.length === 0) {
        const err = new Error('النص مطلوب');
        err.status = 400;
        throw err;
      }
      input = Buffer.from(req.body.text, 'utf8');
    } else {
      if (!req.file) {
        const err = new Error('الملف مطلوب');
        err.status = 400;
        throw err;
      }
      input = req.file.buffer;
      filename = req.file.originalname;
    }

    const secret =
      String(algorithm).toLowerCase() === RSA_ID ? publicKey : password;

    const env = svc.encrypt(input, secret);
    if (filename) env.filename = filename;

    res.json({ ok: true, result: envelope.pack(env) });
  } catch (e) {
    next(e);
  }
});

// ===== فك التشفير =====
// يُرسل عبر application/json: { algorithm, password/privateKey, payload }
router.post('/decrypt/:type', (req, res, next) => {
  try {
    const { type } = req.params;
    assertType(type);

    const { algorithm, password, privateKey, payload } = req.body;
    const env = envelope.unpack(payload);
    const svc = getService(algorithm);

    const secret =
      String(algorithm).toLowerCase() === RSA_ID ? privateKey : password;

    let output;
    try {
      output = svc.decrypt(env, secret);
    } catch (err) {
      // أخطاء فك التشفير (وسم توثيق خاطئ، حشو غير صالح...) غالبًا تعني
      // كلمة مرور/مفتاح خاطئًا أو بيانات تالفة — نحوّلها إلى خطأ 400 واضح.
      if (!err.status) {
        err.status = 400;
        err.message = 'فشل فك التشفير (كلمة مرور/مفتاح خاطئ أو بيانات تالفة)';
      }
      throw err;
    }

    // نقرّر شكل الإخراج حسب المغلّف نفسه: إن كان يحمل اسم ملف فهو بيانات ثنائية.
    // هذا يجعل اللصق-ثم-الفك يعمل بصرف النظر عن التبويب المختار في الواجهة.
    if (env.filename) {
      // للملفات: نُرجِع البيانات كـ base64 ليعيد المتصفح بناء الملف ويحمّله
      res.json({
        ok: true,
        kind: 'file',
        result: output.toString('base64'),
        filename: env.filename,
      });
    } else {
      res.json({ ok: true, kind: 'text', result: output.toString('utf8') });
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
